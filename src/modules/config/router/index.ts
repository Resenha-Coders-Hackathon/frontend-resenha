import type { RouteRecordRaw } from 'vue-router'

export const configRoutes: RouteRecordRaw[] = [
  {
    path: '/configuracoes',
    meta: { requiresAuth: true },
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: 'email',
        name: 'ChangeEmail',
        component: () => import('../views/ChangeEmailView.vue'),
      },
      {
        path: '',
        name: 'Configurações',
        component: () => import('../views/ConfigView.vue'),
      },
    ],
  },
]
