import type { RouteRecordRaw } from 'vue-router'

export const reportsRoutes: RouteRecordRaw[] = [
  {
    path: '/relatorios',
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [{ path: '', name: 'Reports', component: () => import('../views/ReportsView.vue') }],
  },
]
