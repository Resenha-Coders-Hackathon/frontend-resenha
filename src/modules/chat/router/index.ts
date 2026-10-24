import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/modules/auth'
import { toast } from 'vue-sonner'

export const chatRoutes: RouteRecordRaw[] = [
  {
    path: '/mensagens',
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '/chat',
        name: 'Chat',
        component: () => import('../views/ChatView.vue'),
      },
    ],
  },
  {
    path: '/assistente',
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Assistant',
        meta: { requiresAuth: true },
        beforeEnter: async () => {
          try {
            const user = await useAuthStore().loadUser()
            if (!user) return { name: 'Login', query: { redirect: '/assistente' } }
            if (!user.is_subscriber) return { name: 'Plans' }
            return true
          } catch {
            toast.error('Não foi possível verificar seu acesso à IA. Tente novamente.')
            return false
          }
        },
        component: () => import('../views/AssistantView.vue'),
      },
    ],
  },
]
