import { createRouter, createWebHistory } from 'vue-router'
import { moduleRoutes } from '@/modules/module/router'
import { authRoutes } from '@/modules/auth/router'

import { mapboxRoutes } from '@/modules/mapbox/router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...moduleRoutes, ...authRoutes, ...mapboxRoutes],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
