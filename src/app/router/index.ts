import { createRouter, createWebHistory } from 'vue-router'
import { moduleRoutes } from '@/modules/module/router'
import { authRoutes } from '@/modules/auth/router'
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

export default router
