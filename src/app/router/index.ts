import { createRouter, createWebHistory } from 'vue-router'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/modules/auth'
import { organizationRoutes } from '@/modules/organizations'
import { invitationRoutes } from '@/modules/invitations'

import { authRoutes } from '@/modules/auth/router'
import { geolocationRoutes } from '@/modules/geolocation/router'
import { mapboxRoutes } from '@/modules/mapbox/router'
import { moduleRoutes } from '@/modules/module/router'
import { notificationsRoutes } from '@/modules/notifications/router'
import { paymentsRoutes } from '@/modules/payments/router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    ...organizationRoutes,
    ...invitationRoutes,
    ...geolocationRoutes,
    ...mapboxRoutes,
    ...moduleRoutes,
    ...notificationsRoutes,
    ...paymentsRoutes,
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// Só a primeira navegação protegida consulta o backend; depois o interceptor do axios
// (refresh + redirecionamento) cuida de sessões que expiram.
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return
  const auth = useAuthStore()
  if (auth.user) return
  try {
    if (!(await auth.loadUser())) {
      return { path: '/entrar', query: { redirect: to.fullPath } }
    }
  } catch {
    toast.error('Não foi possível verificar sua sessão. Confira a conexão e tente novamente.')
    return false
  }
})

export default router
