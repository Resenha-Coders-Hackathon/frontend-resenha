import type { RouteRecordRaw } from 'vue-router'

export const reportsRoutes: RouteRecordRaw[] = [
  {
    path: '/relatorios',
    meta: { requiresAuth: true, transitionGroup: 'default' },
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [{ path: '', name: 'Reports', component: () => import('../views/ReportsView.vue') }],
  },
]
