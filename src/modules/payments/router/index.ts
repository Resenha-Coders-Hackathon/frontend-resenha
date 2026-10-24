import type { RouteRecordRaw } from 'vue-router'

export const paymentsRoutes: RouteRecordRaw[] = [
  {
    path: '/faturamento',
    meta: { requiresAuth: true, transitionGroup: 'default' },
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [{ path: '', name: 'Billing', component: () => import('../views/BillingView.vue') }],
  },
  {
    path: '/planos',
    meta: { requiresAuth: true, transitionGroup: 'default' },
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Plans',
        component: () => import('../views/PlansView.vue'),
      },
    ],
  },
  {
    path: '/pagamentos',
    meta: { requiresAuth: true, transitionGroup: 'default' },
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Payment',
        component: () => import('../views/PaymentFormView.vue'),
      },
      {
        path: '/pagamentos/:id',
        name: 'PaymentPix',
        component: () => import('../views/PaymentPixView.vue'),
        props: true,
      },
      {
        path: '/pagamentos/:id/status',
        name: 'PaymentResult',
        component: () => import('../views/PaymentResultView.vue'),
        props: true,
      },
    ],
  },
]
