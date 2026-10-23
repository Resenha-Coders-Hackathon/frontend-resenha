import { nextTick } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'

const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)'
const FULL = 'inset(0px 0px 0px 0px)'

// recorte (clip-path) que deixa visível só a área do painel escuro
function clipFor(rect: DOMRect) {
  const right = window.innerWidth - rect.right
  const bottom = window.innerHeight - rect.bottom
  return `inset(${rect.top}px ${right}px ${bottom}px ${rect.left}px)`
}

function asideRect() {
  const rect = document.querySelector('.auth-aside')?.getBoundingClientRect()
  return rect && rect.width > 0 ? rect : undefined
}

// Troca login <-> registro: o painel escuro cresce até cobrir a tela, a página troca
// por baixo e ele encolhe até a posição do painel na outra tela.
// Sem painel visível (telas pequenas) ou com movimento reduzido, apenas navega.
export function useAuthSwap() {
  const router = useRouter()
  let isSwapping = false

  async function swapTo(to: RouteLocationRaw) {
    const from = asideRect()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!from || reduceMotion) {
      await router.push(to)
      return
    }
    if (isSwapping) return
    isSwapping = true

    const overlay = document.createElement('div')
    overlay.setAttribute('aria-hidden', 'true')
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:9999;background:var(--background-inverse);'
    document.body.append(overlay)

    try {
      // o texto do painel some suavemente enquanto ele começa a crescer
      await overlay.animate(
        [
          { clipPath: clipFor(from), opacity: 0 },
          { clipPath: clipFor(from), opacity: 1, offset: 0.15 },
          { clipPath: FULL, opacity: 1 },
        ],
        { duration: 560, easing: EASE, fill: 'forwards' },
      ).finished

      await router.push(to)
      await nextTick()

      const target = asideRect()
      if (target) {
        await overlay.animate([{ clipPath: FULL }, { clipPath: clipFor(target) }], {
          duration: 620,
          easing: EASE,
          fill: 'forwards',
        }).finished
      }

      // revela o texto do novo painel por baixo
      await overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 180,
        easing: 'ease-out',
        fill: 'forwards',
      }).finished
    } finally {
      overlay.remove()
      isSwapping = false
    }
  }

  return { swapTo }
}
export { useAuthNavigation } from './useAuthNavigation'
