import type { RouteRecordRaw } from 'vue-router'

export const calendarRoutes: RouteRecordRaw[] = [
  {
    path: '/calendario',
    meta: { requiresAuth: true },
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      { path: '', name: 'Calendar', component: () => import('../views/CalendarView.vue') },
    ],
  },
]
