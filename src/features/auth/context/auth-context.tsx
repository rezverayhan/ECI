import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase/client'
import { fetchAppUser } from '../api/app-user'
import type { AccessLevel, AppUser } from '../types'

type AuthStatus = 'loading' | 'unauthenticated' | 'blocked' | 'error' | 'authenticated'

interface SignInResult {
  error: string | null
}

interface AuthContextValue {
  status: AuthStatus
  session: Session | null
  appUser: AppUser | null
  accessLevel: AccessLevel | null
  signIn: (email: string, password: string) => Promise<SignInResult>
  signOut: () => Promise<void>
  retryAppUser: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [sessionResolved, setSessionResolved] = useState(false)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return
      setSession(data.session)
      setSessionResolved(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setSessionResolved(true)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const authUserId = session?.user.id

  const appUserQuery = useQuery({
    queryKey: ['app-user', authUserId],
    queryFn: () => fetchAppUser(authUserId!),
    enabled: Boolean(authUserId),
    staleTime: 60_000,
  })

  const status: AuthStatus = useMemo(() => {
    if (!sessionResolved) return 'loading'
    if (!session) return 'unauthenticated'
    if (appUserQuery.isPending) return 'loading'
    if (appUserQuery.isError) return 'error'
    if (!appUserQuery.data) return 'blocked'
    return 'authenticated'
  }, [sessionResolved, session, appUserQuery.isPending, appUserQuery.isError, appUserQuery.data])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      appUser: appUserQuery.data ?? null,
      accessLevel: appUserQuery.data?.access_level ?? null,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          return { error: 'Your email or password is incorrect.' }
        }
        return { error: null }
      },
      async signOut() {
        await supabase.auth.signOut()
        // Clear the entire cache, not just app-user: this is a shared admin
        // console where a different account can sign in next in the same
        // tab, and every other query (users list, dashboard, support, etc.)
        // is RLS-scoped to whoever was signed in — leaving it cached would
        // let a prior session's data flash for the next one.
        queryClient.clear()
      },
      retryAppUser() {
        appUserQuery.refetch()
      },
    }),
    [status, session, appUserQuery, queryClient],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
