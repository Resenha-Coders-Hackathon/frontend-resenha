import type { RouteRecordRaw } from 'vue-router'

export const uploadsRoutes: RouteRecordRaw[] = [
  {
    path: '/arquivos',
    meta: { transitionGroup: 'default' },
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [{ path: '', name: 'Files', component: () => import('../views/FilesView.vue') }],
  },
]
