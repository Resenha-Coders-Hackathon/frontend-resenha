import type { Router } from 'vue-router'
import { toast } from 'vue-sonner'
import { safeRedirect, useAuthStore } from '@/modules/auth'

declare module 'vue-router' {
  interface RouteMeta {
    /** Routes require a server-validated session unless explicitly public. */
    requiresAuth?: boolean
    guestOnly?: boolean
  }
}

export function installAuthGuard(router: Router): void {
  router.beforeEach(async (to) => {
    const requiresAuth = to.meta.requiresAuth !== false
    if (!requiresAuth && !to.meta.guestOnly) return

    try {
      // Revalidate even when a profile is cached: the session may have been revoked.
      const user = await useAuthStore().loadUser()
      if (!user && requiresAuth) {
        return { name: 'Login', query: { redirect: to.fullPath }, replace: true }
      }
      if (user && to.meta.guestOnly) {
        const destination = safeRedirect(to.query.redirect)
        return router.resolve(destination).meta.guestOnly ? '/' : destination
      }
    } catch {
      if (requiresAuth) {
        toast.error('Não foi possível verificar sua sessão. Confira a conexão e tente novamente.')
        return false
      }
    }
  })
}
