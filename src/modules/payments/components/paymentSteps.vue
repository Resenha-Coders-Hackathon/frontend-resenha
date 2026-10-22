<script setup lang="ts">
interface Props {
  current: 1 | 2 | 3
  completed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  completed: false,
})

const steps = ['Dados', 'Pix', 'Confirmação']

const isDone = (index: number) => index + 1 < props.current || props.completed
const isActive = (index: number) => index + 1 === props.current && !props.completed

const circleClasses = (index: number) => {
  if (isDone(index) || isActive(index)) {
    return 'bg-(--surface-inverse) text-(--text-inverse) dark:bg-(--surface) dark:text-(--text-primary)'
  }
  return 'border border-(--border-default) text-(--text-muted) dark:border-(--border-inverse)'
}

const lineClasses = (index: number) =>
  isDone(index)
    ? 'bg-(--border-strong) dark:bg-(--text-inverse)'
    : 'bg-(--border-default) dark:bg-(--border-inverse)'
</script>

<template>
  <ol class="flex w-full items-center" aria-label="Etapas do pagamento">
    <li
      v-for="(step, index) in steps"
      :key="step"
      :class="['flex items-center', index < steps.length - 1 ? 'flex-1' : '']"
      :aria-current="isActive(index) ? 'step' : undefined"
    >
      <span class="flex items-center gap-2">
        <span
          :class="[
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300',
            circleClasses(index),
          ]"
        >
          <span v-if="isDone(index)" class="material-symbols-outlined text-[18px]">check</span>
          <template v-else>{{ index + 1 }}</template>
        </span>

        <span
          :class="[
            'whitespace-nowrap text-xs font-medium sm:text-sm',
            isDone(index) || isActive(index) ? '' : 'text-(--text-muted)',
          ]"
        >
          {{ step }}
        </span>
      </span>

      <span
        v-if="index < steps.length - 1"
        :class="['mx-3 h-px flex-1 transition-all duration-300', lineClasses(index)]"
      />
    </li>
  </ol>
</template>
