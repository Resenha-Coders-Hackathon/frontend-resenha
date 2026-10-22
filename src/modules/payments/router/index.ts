import type { RouteRecordRaw } from 'vue-router'

export const paymentsRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '/pagamentos',
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
