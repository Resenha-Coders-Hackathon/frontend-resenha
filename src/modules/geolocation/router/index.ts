import type { RouteRecordRaw } from 'vue-router'

export const geolocationRoutes: RouteRecordRaw[] = [
  {
    path: '/localizacao',
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Geolocation',
        component: () => import('../views/HomeView.vue'),
      },
    ],
  },
]
