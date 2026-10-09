// IT Administrator-initiated password reset for an employee.
//
// No service-role key is used anywhere in this function. Authorization and
// the target-employee lookup both happen through a Supabase client scoped
// to the CALLER's own forwarded JWT, so RLS (is_it_administrator() /
// users_select) is the real boundary — identical to how every other
// server-side check in this app works. The actual reset is triggered via
// Supabase Auth's own resetPasswordForEmail, which only ever emails a
// secure, time-limited recovery link — it never reveals or sets a password
// here, and never requires elevated privileges to call.
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
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
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const callerClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: isAdmin, error: adminCheckError } = await callerClient.rpc('is_it_administrator')
  if (adminCheckError) {
    return new Response(JSON.stringify({ error: 'Unable to verify authorization.' }), { status: 500 })
  }
  if (!isAdmin) {
    return new Response(
      JSON.stringify({ error: 'Only IT Administrators can initiate a credential reset.' }),
      { status: 403 },
    )
  }

  const { data: target, error: targetError } = await callerClient
    .from('users')
    .select('id, official_email, full_name')
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

  const origin = req.headers.get('origin') ?? new URL(req.url).origin
  const { error: resetError } = await callerClient.auth.resetPasswordForEmail(target.official_email, {
    redirectTo: `${origin}/reset-password`,
  })
  if (resetError) {
    return new Response(
      JSON.stringify({ error: 'Unable to send the credential reset email. Please try again.' }),
      { status: 500 },
    )
  }

  // Best-effort audit entry — mirrors every other IT-admin-driven mutation
  // in this app (logAuditEvent). Caller is a verified IT Administrator, so
  // audit_logs_insert's RLS check is satisfied; a failure here is logged
  // but never reverses the reset email that has already been sent.
  const { data: callerId } = await callerClient.rpc('current_user_id')
  if (callerId) {
    const { error: auditError } = await callerClient.from('audit_logs').insert({
      actor_user_id: callerId,
      action: 'PASSWORD_RESET_INITIATED',
      entity_type: 'users',
      entity_id: target.id,
      new_values: { target_email: target.official_email },
    })
    if (auditError) {
      console.error('Failed to write audit log for password reset', auditError)
    }
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 })
})
