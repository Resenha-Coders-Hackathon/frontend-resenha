import type { RouteRecordRaw } from 'vue-router'

export const geolocationRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '/localizacao',
        name: 'Geolocation',
        component: () => import('../views/HomeView.vue'),
      },
    ],
  },
]
