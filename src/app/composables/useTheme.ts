import { computed, onMounted, ref } from 'vue'

type Theme = 'light' | 'dark' | 'system'
const theme = ref<Theme>('system')
const systemDark = ref(false)
let initialized = false

function applyTheme(): void {
  document.documentElement.classList.toggle(
    'dark',
    theme.value === 'dark' || (theme.value === 'system' && systemDark.value),
  )
}

function setTheme(value: Theme): void {
  theme.value = value
  localStorage.setItem('theme', value)
  applyTheme()
}

const isDark = computed({
  get: () => theme.value === 'dark' || (theme.value === 'system' && systemDark.value),
  set: (value: boolean) => setTheme(value ? 'dark' : 'light'),
})

export function useTheme() {
  onMounted(() => {
    if (initialized) return
    initialized = true
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    systemDark.value = media.matches
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark' || saved === 'system') theme.value = saved
    media.addEventListener('change', (event) => {
      systemDark.value = event.matches
      applyTheme()
    })
    applyTheme()
  })
  return {
    isDark,
    theme,
    setTheme,
    toggleTheme: () => {
      isDark.value = !isDark.value
    },
  }
}
