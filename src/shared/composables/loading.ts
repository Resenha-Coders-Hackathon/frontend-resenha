import { ref } from 'vue'

const loading = ref(false)

export const useLoading = () => {
  function start() {
    loading.value = true
  }

  function stop() {
    loading.value = false
  }

  return { loading, start, stop }
}
