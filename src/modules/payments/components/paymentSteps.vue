<script setup lang="ts">
interface Props {
  current: 1 | 2 | 3
  completed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  completed: false,
})

const steps = ['Dados', 'Pagamento', 'Confirmação']

const isDone = (index: number) => index + 1 < props.current || props.completed
const isActive = (index: number) => index + 1 === props.current && !props.completed

const circleClasses = (index: number) => {
  if (isDone(index) || isActive(index)) {
    return 'bg-(--bg-orange) text-white'
  }
  return 'border border-(--border-default) text-(--text-muted) dark:border-(--border-inverse)'
}

const lineClasses = (index: number) =>
  isDone(index) ? 'bg-(--bg-orange)' : 'bg-(--border-default) dark:bg-(--border-inverse)'
</script>

<template>
  <ol class="flex w-full items-center" aria-label="Etapas do pagamento">
    <li
      v-for="(step, index) in steps"
      :key="step"
      :class="['flex items-center', index < steps.length - 1 ? 'flex-1' : '']"
      :aria-current="isActive(index) ? 'step' : undefined"
    >
      <span class="flex items-center gap-[8px]">
        <span
          :class="[
            'flex size-[26px] shrink-0 items-center justify-center rounded-full text-[12px] leading-none font-semibold transition-all duration-300',
            circleClasses(index),
          ]"
        >
          <span v-if="isDone(index)" class="material-symbols-outlined text-[15px]!">check</span>
          <template v-else>{{ index + 1 }}</template>
        </span>

        <span
          :class="[
            'whitespace-nowrap text-[13px] leading-normal font-medium',
            isActive(index) ? 'text-(--bg-orange)' : isDone(index) ? '' : 'text-(--text-muted)',
          ]"
        >
          {{ step }}
        </span>
      </span>

      <span
        v-if="index < steps.length - 1"
        :class="['mx-[12px] h-px flex-1 transition-all duration-300', lineClasses(index)]"
      />
    </li>
  </ol>
</template>
