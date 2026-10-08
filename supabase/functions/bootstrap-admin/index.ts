// One-time bootstrap: resets the password for, and links/elevates the
// public.users profile of, the single approved Main System Administrator
// account. The target email is hardcoded so this function can never be used
// to act on any other account, however it is called. The password is read
// only from the request body for this one invocation — it is never written
// to source, logs, or any database table.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const BOOTSTRAP_EMAIL = 'rezbi.ecidhaka@elcorteingles.es'

// This function is deployed with verify_jwt disabled (no session exists yet
// to bootstrap with), so it implements its own gate instead: a one-off nonce
// generated for this single deployment, known only to the operator who
// deploys and immediately invokes it. It only ever acts on the one hardcoded
// email above, so the worst case of this token leaking is a password reset
// on that single account, not a general-purpose admin-creation endpoint.
const BOOTSTRAP_TOKEN = 'eci-bootstrap-f3a9c1d6-8b2e-4a7f-9c1d-6b2e4a7f9c1d'

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  if (req.headers.get('x-bootstrap-token') !== BOOTSTRAP_TOKEN) {
    return new Response(JSON.stringify({ error: 'Unauthorized.' }), { status: 401 })
  }

  let password: string
  try {
    const body = await req.json()
    password = body.password
    if (typeof password !== 'string' || password.length < 6) {
      return new Response(JSON.stringify({ error: 'A password of at least 6 characters is required.' }), {
        status: 400,
      })
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), { status: 400 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const admin = createClient(supabaseUrl, serviceRoleKey)

  const { data: userList, error: listError } = await admin.auth.admin.listUsers()
  if (listError) {
    return new Response(JSON.stringify({ error: 'Unable to look up account.' }), { status: 500 })
  }
  const authUser = userList.users.find((u) => u.email === BOOTSTRAP_EMAIL)
  if (!authUser) {
    return new Response(
      JSON.stringify({
        error: 'Bootstrap account does not exist yet. Create it via the Supabase Dashboard first.',
      }),
      { status: 404 },
    )
  }

  // Refuse before touching anything if bootstrap already completed — this is
  // the real safety boundary, not the token above. Once this account is a
  // linked, active IT Administrator, this endpoint permanently stops
  // accepting password resets for it, regardless of who calls it or how.
  const { data: existingProfile, error: profileSelectError } = await admin
    .from('users')
    .select('id, access_level, is_active')
    .eq('auth_user_id', authUser.id)
    .maybeSingle()
  if (profileSelectError) {
    return new Response(JSON.stringify({ error: profileSelectError.message }), { status: 500 })
  }
  if (existingProfile?.access_level === 'it_administrator' && existingProfile.is_active) {
    return new Response(
      JSON.stringify({
        error:
          'Bootstrap already completed for this account. This endpoint no longer accepts password resets — use the Supabase Dashboard for further changes.',
      }),
      { status: 403 },
    )
  }

  const { error: pwError } = await admin.auth.admin.updateUserById(authUser.id, { password })
  if (pwError) {
    return new Response(JSON.stringify({ error: pwError.message }), { status: 500 })
  }

  if (existingProfile) {
    const { error: updateError } = await admin
      .from('users')
      .update({ access_level: 'it_administrator', is_active: true })
      .eq('id', existingProfile.id)
    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500 })
    }
    return new Response(
      JSON.stringify({ success: true, action: 'password_reset_and_profile_updated' }),
      { status: 200 },
    )
  }

  // Reuse existing reference data where it already exists; never duplicate.
  const { data: dept, error: deptSelectError } = await admin
    .from('departments')
    .select('id')
    .eq('name', 'IT')
    .maybeSingle()
  if (deptSelectError) {
    return new Response(JSON.stringify({ error: deptSelectError.message }), { status: 500 })
  }
  let departmentId = dept?.id as string | undefined
  if (!departmentId) {
    const { data: newDept, error } = await admin
      .from('departments')
      .insert({ name: 'IT' })
      .select('id')
      .single()
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    departmentId = newDept.id
  }

  const { data: desig, error: desigSelectError } = await admin
    .from('designations')
    .select('id')
    .eq('name', 'System Administrator')
    .maybeSingle()
  if (desigSelectError) {
    return new Response(JSON.stringify({ error: desigSelectError.message }), { status: 500 })
  }
  let designationId = desig?.id as string | undefined
  if (!designationId) {
    const { data: newDesig, error } = await admin
      .from('designations')
      .insert({ name: 'System Administrator' })
      .select('id')
      .single()
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    designationId = newDesig.id
  }

  const { error: insertError } = await admin.from('users').insert({
    auth_user_id: authUser.id,
    employee_id: 'IT-ADMIN-001',
    user_id: 'ITADMIN001',
    full_name: 'System Administrator',
    official_email: BOOTSTRAP_EMAIL,
    designation_id: designationId,
    department_id: departmentId,
    employment_status: 'active',
    access_level: 'it_administrator',
    is_active: true,
  })

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
  }

  return new Response(
    JSON.stringify({ success: true, action: 'password_reset_and_profile_created' }),
    { status: 200 },
  )
})
