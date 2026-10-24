<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ value: string | number }>()

interface ParsedNumber {
  value: number
  prefix: string
  suffix: string
  fractionDigits: number
}

function parseNumber(value: string | number): ParsedNumber | null {
  const text = String(value)
  const match = /^(.*?)(-?[\d.,]+)(.*)$/.exec(text)
  if (!match) return null

  const raw = match[2]
  const number =
    typeof value === 'number' ? value : Number(raw.replaceAll('.', '').replace(',', '.'))
  if (!Number.isFinite(number)) return null

  const fractionDigits =
    typeof value === 'number' ? (raw.split('.')[1]?.length ?? 0) : (raw.split(',')[1]?.length ?? 0)

  return {
    value: number,
    prefix: match[1],
    suffix: match[3],
    fractionDigits: Math.min(fractionDigits, 6),
  }
}

function formatNumber(parsed: ParsedNumber, value: number): string {
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: parsed.fractionDigits,
    maximumFractionDigits: parsed.fractionDigits,
  }).format(value)

  return `${parsed.prefix}${formatted}${parsed.suffix}`
}

const initialNumber = parseNumber(props.value)
const displayed = ref(initialNumber ? formatNumber(initialNumber, 0) : String(props.value))
let animationFrame = 0

function animate(value: string | number, fromZero = false) {
  if (animationFrame) cancelAnimationFrame(animationFrame)

  const next = parseNumber(value)
  if (!next) {
    displayed.value = String(value)
    return
  }

  if (
    typeof window === 'undefined' ||
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ) {
    displayed.value = formatNumber(next, next.value)
    return
  }

  const previous = parseNumber(displayed.value)
  const start = fromZero ? 0 : (previous?.value ?? 0)
  const startedAt = performance.now()
  const duration = 680

  const tick = (now: number) => {
    const progress = Math.min((now - startedAt) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    displayed.value = formatNumber(next, start + (next.value - start) * eased)

    if (progress < 1) animationFrame = requestAnimationFrame(tick)
    else {
      displayed.value = formatNumber(next, next.value)
      animationFrame = 0
    }
  }

  animationFrame = requestAnimationFrame(tick)
}

watch(
  () => props.value,
  (value) => animate(value),
)
onMounted(() => animate(props.value, true))
onBeforeUnmount(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
})
</script>

<template>
  <span class="tabular-nums">{{ displayed }}</span>
</template>
