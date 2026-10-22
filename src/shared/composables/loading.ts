import { ref } from 'vue'

const loading = ref<boolean>(false)

export const useLoading = () => {
  function start(): void {
    loading.value = true
  }

  function stop(): void {
    loading.value = false
  }

  return { loading, start, stop }
}
