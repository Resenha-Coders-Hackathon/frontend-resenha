import type { RouteRecordRaw } from 'vue-router'

export const moduleRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      // a raiz abre o dashboard real; o nome 'Home' continua valendo para quem navega por nome
      { path: '', name: 'Home', redirect: { name: 'UserHome' } },
      {
        path: '/home-usuario',
        name: 'UserHome',
        component: () => import('../views/UserHomeView.vue'),
      },
      {
        path: '/setores/:sectorId',
        name: 'SectorBoard',
        meta: { requiresAuth: true },
        component: () => import('../views/SectorBoardView.vue'),
        props: true,
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFoundView.vue'),
      },
    ],
  },
]
