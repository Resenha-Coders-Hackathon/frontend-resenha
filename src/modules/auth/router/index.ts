import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/auth',
    redirect: { name: 'Login' },
    meta: { requiresAuth: false, guestOnly: true, transitionGroup: 'auth' },
    component: () => import('@/app/layouts/AuthLayout.vue'),
    children: [
      {
        path: '/entrar',
        name: 'Login',
        component: () => import('../views/LoginView.vue'),
      },
      {
        path: '/registrar',
        name: 'Register',
        component: () => import('../views/RegisterView.vue'),
      },
      {
        path: '/registrar/codigo',
        name: 'RegisterCode',
        component: () => import('../views/VerifyCodeView.vue'),
        props: { flow: 'register' },
      },
      {
        path: '/esqueci-senha',
        name: 'ForgotPassword',
        component: () => import('../views/ForgotPasswordView.vue'),
      },
      {
        path: '/esqueci-senha/codigo',
        name: 'ResetCode',
        component: () => import('../views/VerifyCodeView.vue'),
        props: { flow: 'reset' },
      },
      {
        path: '/esqueci-senha/nova-senha',
        name: 'ResetPassword',
        component: () => import('../views/ResetPasswordView.vue'),
      },
    ],
  },
]
