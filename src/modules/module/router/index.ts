import type { RouteRecordRaw } from 'vue-router'

export const moduleRoutes: RouteRecordRaw[] = [
  // páginas públicas exigidas pela tela de consentimento OAuth do Google
  {
    path: '/politica-de-privacidade',
    name: 'PrivacyPolicy',
    meta: { requiresAuth: false },
    props: { doc: 'privacidade' },
    component: () => import('../views/LegalView.vue'),
  },
  {
    path: '/termos-de-servico',
    name: 'TermsOfService',
    meta: { requiresAuth: false },
    props: { doc: 'termos' },
    component: () => import('../views/LegalView.vue'),
  },
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
