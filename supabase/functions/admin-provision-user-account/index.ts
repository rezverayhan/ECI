// IT Administrator-initiated account provisioning for an employee who has no
// linked Supabase Auth account yet (public.users.auth_user_id is null).
//
// createUser() in the app only ever inserts the public.users IT-record row —
// it never had a path to create the matching auth.users account, so every
// employee added that way could never sign in. This function closes that
// gap: it creates (or reuses, if one already exists for that email) the
// auth.users account via the Admin API and sends Supabase's own secure
// invite-link email, then links auth_user_id back onto the public.users row.
//
// Authorization mirrors admin-reset-password: the caller's own forwarded JWT
// is used for the is_it_administrator() check and for the public.users
// lookup/update (RLS is the real boundary there, no elevated client needed).
// The Admin API call is the one step that genuinely requires the service
// role — unlike a password reset, creating a brand-new auth account cannot
// be done as the (not-yet-existing) target user, and Supabase intentionally
// doesn't expose an unprivileged "create and invite" call. The service-role
// client here is used for nothing except auth.admin.* — it never touches
// application tables.
import { createClient } from 'jsr:@supabase/supabase-js@2'

// This project is provisioned with the new sb_publishable_/sb_secret_ key system (see
// .env.local / VITE_SUPABASE_PUBLISHABLE_KEY), not the legacy anon/service_role JWTs.
// Supabase only auto-injects SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY into Edge
// Functions when those legacy keys actually exist for the project — a project created
// under the new system may have neither, which previously made createClient() receive
// `undefined` and throw before any of this function's own error responses could run
// (an uncaught crash returns a raw platform 500 with no JSON body — nothing for the
// client to unwrap, which is why even correct client-side error handling still showed
// only the generic fallback). Read the new dictionary-shaped secrets first, falling
// back to the legacy ones so this keeps working on either kind of project.
function readKey(newEnvVar: string, legacyEnvVar: string): string {
  const dict = Deno.env.get(newEnvVar)
  if (dict) {
    try {
      const parsed = JSON.parse(dict)
      if (typeof parsed?.default === 'string' && parsed.default) return parsed.default
    } catch {
      // fall through to legacy
    }
  }
  const legacy = Deno.env.get(legacyEnvVar)
  if (legacy) return legacy
  throw new Error(`Missing Supabase key: neither ${newEnvVar} nor ${legacyEnvVar} is configured.`)
}

Deno.serve(async (req: Request) => {
  try {
    return await handle(req)
  } catch (err) {
    // Last-resort guard so a misconfiguration (e.g. no key of either kind available)
    // always returns a parseable JSON body instead of an opaque platform crash page.
    console.error('admin-provision-user-account crashed', err)
    return new Response(
      JSON.stringify({ error: 'Server configuration error. Contact IT.' }),
      { status: 500 },
    )
  }
})

async function handle(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Not authenticated.' }), { status: 401 })
  }

  let employeeId: string
  try {
    const body = await req.json()
    employeeId = body.employeeId
    if (typeof employeeId !== 'string' || employeeId.length === 0) {
      return new Response(JSON.stringify({ error: 'employeeId is required.' }), { status: 400 })
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), { status: 400 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const publishableKey = readKey('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY')
  const callerClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: isAdmin, error: adminCheckError } = await callerClient.rpc('is_it_administrator')
  if (adminCheckError) {
    return new Response(JSON.stringify({ error: 'Unable to verify authorization.' }), { status: 500 })
  }
  if (!isAdmin) {
    return new Response(
      JSON.stringify({ error: 'Only IT Administrators can provision a login account.' }),
      { status: 403 },
    )
  }

  const { data: target, error: targetError } = await callerClient
    .from('users')
    .select('id, official_email, full_name, auth_user_id')
    .eq('id', employeeId)
    .maybeSingle()
  if (targetError) {
    return new Response(JSON.stringify({ error: 'Unable to look up this employee.' }), { status: 500 })
  }
  if (!target || !target.official_email) {
    return new Response(
      JSON.stringify({ error: 'This employee has no account email on record.' }),
      { status: 404 },
    )
  }
  if (target.auth_user_id) {
    // Already linked — nothing to do. Not an error: callers may retry safely.
    return new Response(JSON.stringify({ success: true, alreadyLinked: true }), { status: 200 })
  }

  const serviceRoleKey = readKey('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY')
  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  // Reuse an existing auth.users account for this email if one already
  // exists (e.g. provisioning was retried after the link-back step failed
  // last time) instead of letting inviteUserByEmail error on a duplicate.
  const { data: userList, error: listError } = await adminClient.auth.admin.listUsers()
  if (listError) {
    return new Response(JSON.stringify({ error: 'Unable to check for an existing account.' }), { status: 500 })
  }
  let authUserId = userList.users.find((u) => u.email === target.official_email)?.id ?? null

  if (!authUserId) {
    const origin = req.headers.get('origin') ?? new URL(req.url).origin
    const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      target.official_email,
      { redirectTo: `${origin}/reset-password` },
    )
    if (inviteError || !invited.user) {
      return new Response(
        JSON.stringify({ error: 'Unable to create or invite the login account. Please try again.' }),
        { status: 500 },
      )
    }
    authUserId = invited.user.id
  }

  const { error: linkError } = await callerClient
    .from('users')
    .update({ auth_user_id: authUserId })
    .eq('id', employeeId)
  if (linkError) {
    return new Response(
      JSON.stringify({ error: 'Account was created but could not be linked to this employee record. Contact IT.' }),
      { status: 500 },
    )
  }

  const { data: callerId } = await callerClient.rpc('current_user_id')
  if (callerId) {
    const { error: auditError } = await callerClient.from('audit_logs').insert({
      actor_user_id: callerId,
      action: 'USER_ACCOUNT_PROVISIONED',
      entity_type: 'users',
      entity_id: target.id,
      new_values: { target_email: target.official_email },
    })
    if (auditError) {
      console.error('Failed to write audit log for account provisioning', auditError)
    }
  }

  return new Response(JSON.stringify({ success: true, alreadyLinked: false }), { status: 200 })
}
