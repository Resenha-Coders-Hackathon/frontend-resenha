import type { RouteRecordRaw } from 'vue-router'

export const notificationsRoutes: RouteRecordRaw[] = [
  {
    path: '/notificacoes',
    meta: { transitionGroup: 'default' },
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Notifications',
        meta: { requiresAuth: true },
        component: () => import('../views/HomeView.vue'),
      },
    ],
  },
]
