import type { RouteRecordRaw } from 'vue-router'

export const moduleRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/app/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/HomeView.vue'),
      },
      {
        path: '/minhas-tarefas',
        name: 'MyTasks',
        component: () => import('../views/MyTasksView.vue'),
      },
      {
        path: '/kanban',
        name: 'Mural',
        component: () => import('../views/KanbanView.vue'),
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFoundView.vue'),
      },
    ],
  },
]
