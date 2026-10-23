import type { RouteRecordRaw } from 'vue-router'

export const invitationRoutes: RouteRecordRaw[] = [
  {
    path: '/invitations/accept',
    name: 'InvitationAccept',
    component: () => import('../views/InvitationAcceptView.vue'),
  },
]
