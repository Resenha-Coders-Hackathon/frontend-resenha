import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { safeRedirect } from '../utils'

// Sem um redirect pedido (ex.: convite), quem entra cai no dashboard do usuário.
export const USER_HOME = '/'

export function useAuthNavigation() {
  const route = useRoute()
  const destination = computed(() => safeRedirect(route.query.redirect))
  const afterLogin = computed(() => (route.query.redirect ? destination.value : USER_HOME))
  function to(name: string) {
    return { name, query: destination.value === '/' ? {} : { redirect: destination.value } }
  }
  return { destination, afterLogin, to }
}
