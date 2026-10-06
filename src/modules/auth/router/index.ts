import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '/entrar',
        name: 'Login',
        component: () => import('../views/LoginView.vue'),
      },
    ],
  },
]
