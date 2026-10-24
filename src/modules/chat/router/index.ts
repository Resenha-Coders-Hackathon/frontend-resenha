import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/modules/auth'
import { toast } from 'vue-sonner'

async function requireAssistantAccess() {
  try {
    const user = await useAuthStore().loadUser()
    if (!user) return { name: 'Login', query: { redirect: '/assistente' } }
    if (!user.is_subscriber) return { name: 'Plans' }
    return true
  } catch {
    toast.error('Não foi possível verificar seu acesso à IA. Tente novamente.')
    return false
  }
}

export const chatRoutes: RouteRecordRaw[] = [
  {
    path: '/mensagens',
    meta: { transitionGroup: 'default' },
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
    meta: { requiresAuth: true, transitionGroup: 'default' },
    beforeEnter: requireAssistantAccess,
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Assistant',
        component: () => import('../views/AssistantView.vue'),
      },
    ],
  },
]
