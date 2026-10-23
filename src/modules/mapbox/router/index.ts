import type { RouteRecordRaw } from 'vue-router'

export const mapboxRoutes: RouteRecordRaw[] = [
  {
    path: '/mapbox',
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Mapbox',
        component: () => import('../views/HomeView.vue'),
      },
    ],
  },
]
