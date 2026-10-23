import type { RouteRecordRaw } from 'vue-router'

export const configRoutes: RouteRecordRaw[] = [
  {
    path: '/configuracoes',
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Configurações',
        component: () => import('../views/ConfigView.vue'),
      },
    ],
  },
]
