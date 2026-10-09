import { MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AppQueryProvider } from '@/app/providers/query-client'
import { router } from '@/app/router'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { registerServiceWorker } from '@/lib/pwa/register-sw'
import './index.css'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppQueryProvider>
      <AuthProvider>
        <MotionConfig reducedMotion="user">
          <RouterProvider router={router} />
        </MotionConfig>
      </AuthProvider>
    </AppQueryProvider>
  </StrictMode>,
)
