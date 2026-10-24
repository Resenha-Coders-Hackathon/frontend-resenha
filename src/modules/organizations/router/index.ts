import type { RouteRecordRaw } from 'vue-router'

export const organizationRoutes: RouteRecordRaw[] = [
  {
    path: '/organizacoes/:organizationId/times',
    name: 'OrganizationTeams',
    component: () => import('../views/OrganizationTeamsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/organizacoes/:organizationId/setores',
    name: 'OrganizationSectors',
    component: () => import('../views/OrganizationSectorsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/organizacoes/:organizationId/configuracoes',
    name: 'OrganizationSettings',
    component: () => import('../views/OrganizationSettingsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/w/:slug',
    name: 'OrganizationAddress',
    component: () => import('../views/OrganizationAddressView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/organizacoes/:organizationId/configurar-setores',
    name: 'OrganizationOnboardingSectors',
    component: () => import('../views/OrganizationOnboardingView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/organizacoes/nova',
    name: 'OrganizationOnboarding',
    component: () => import('../views/OrganizationOnboardingView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/organizacoes/:organizationId/convidar',
    name: 'OrganizationOnboardingTeam',
    component: () => import('../views/OrganizationOnboardingView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/organizacoes',
    name: 'Organizations',
    component: () => import('../views/OrganizationsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/organizacoes/:organizationId/membros',
    name: 'OrganizationMembers',
    component: () => import('../views/OrganizationMembersView.vue'),
    meta: { requiresAuth: true },
  },
]
