import { createRouter, createWebHistory } from 'vue-router'
import { moduleRoutes } from '@/modules/module/router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...moduleRoutes],
})

export default router
