import { createRouter, createWebHistory } from 'vue-router'
import api from '@/app/plugins/axios'

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

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return
  try {
    await api.get('/users/me/')
  } catch {
    return { path: '/entrar', query: { redirect: to.fullPath } }
  }
})

export default router
