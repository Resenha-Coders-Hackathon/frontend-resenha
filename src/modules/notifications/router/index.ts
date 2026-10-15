import type { RouteRecordRaw } from 'vue-router'

export const notificationsRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '/notificacoes',
        name: 'Notifications',
        component: () => import('../views/HomeView.vue'),
      },
    ],
  },
]
