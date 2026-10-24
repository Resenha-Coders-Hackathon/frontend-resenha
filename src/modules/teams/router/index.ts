import type { RouteRecordRaw } from 'vue-router'

export const teamsRoutes: RouteRecordRaw[] = [
  {
    path: '/equipe',
    meta: { requiresAuth: true },
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      { path: '', name: 'Team', component: () => import('../views/TeamView.vue') },
      {
        path: '/setores/:id/editar',
        name: 'SectorEdit',
        component: () => import('../views/SectorEditView.vue'),
        props: true,
      },
    ],
  },
]
