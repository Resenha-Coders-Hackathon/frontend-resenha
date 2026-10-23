import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { safeRedirect } from '../utils'

export function useAuthNavigation() {
  const route = useRoute()
  const destination = computed(() => safeRedirect(route.query.redirect))
  function to(name: string) {
    return { name, query: destination.value === '/' ? {} : { redirect: destination.value } }
  }
  return { destination, to }
}
