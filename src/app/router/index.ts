import { createRouter, createWebHistory } from 'vue-router'
import api from '@/app/plugins/axios'
import { moduleRoutes } from '@/modules/module/router'
import { authRoutes } from '@/modules/auth/router'
import { useAuthStore } from '@/modules/auth/stores'
import { geolocationRoutes } from '@/modules/geolocation/router'
import { mapboxRoutes } from '@/modules/mapbox/router'
import { notificationsRoutes } from '@/modules/notifications/router'
import { paymentsRoutes } from '@/modules/payments/router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...moduleRoutes,
    ...authRoutes,
    ...geolocationRoutes,
    ...mapboxRoutes,
    ...notificationsRoutes,
    ...paymentsRoutes,
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return
  try {
    await api.get('v1/users/me/')
  } catch {
    return { path: '/entrar', query: { redirect: to.fullPath } }
  }
})

export default router
