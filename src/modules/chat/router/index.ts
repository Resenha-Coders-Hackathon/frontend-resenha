import type { RouteRecordRaw } from 'vue-router'

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
        component: () => import('../views/AssistantView.vue'),
      },
    ],
  },
]
