import type { RouteRecordRaw } from 'vue-router'

export const mapboxRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '/mapbox',
        name: 'Mapbox',
        component: () => import('../views/HomeView.vue'),
      },
    ],
  },
]
