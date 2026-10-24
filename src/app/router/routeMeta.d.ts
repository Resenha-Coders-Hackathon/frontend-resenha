import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    transitionGroup?: 'default' | 'auth'
  }
}

export {}
