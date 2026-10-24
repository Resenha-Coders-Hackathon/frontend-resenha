import type { RouteRecordRaw } from 'vue-router'

export const invitationRoutes: RouteRecordRaw[] = [
  {
    path: '/invitations/accept',
    name: 'InvitationAccept',
    meta: { requiresAuth: false },
    component: () => import('../views/InvitationAcceptView.vue'),
  },
]
