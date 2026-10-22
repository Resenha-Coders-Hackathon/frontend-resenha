import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

export function useScreenSize() {
  const { width } = useWindowSize()

  const isMobile = computed<boolean>(() => width.value < 768)
  const isTablet = computed<boolean>(() => width.value >= 768 && width.value < 1024)
  const isDesktop = computed<boolean>(() => width.value >= 1024)

  return {
    isMobile,
    isTablet,
    isDesktop,
  }
}
