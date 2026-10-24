<script setup lang="ts">
import type { SelectOption } from '../types'

defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    id: string
    label: string
    as?: 'input' | 'select' | 'textarea'
    type?: string
    hint?: string
    options?: SelectOption[]
  }>(),
  { as: 'input', type: 'text', hint: '', options: () => [] },
)

const model = defineModel<string>({ default: '' })

const control =
  'w-full rounded-[10px] border border-(--border-default) bg-(--surface) px-[12px] text-[14px] leading-5 text-(--text-primary) outline-none transition-[border-color,box-shadow] placeholder:text-(--text-muted) focus:border-(--bg-orange) focus:shadow-[0_0_0_3px_rgb(255_103_0/0.12)] disabled:opacity-60 dark:border-(--border-inverse) dark:bg-black/30 dark:text-(--text-inverse) dark:focus:border-(--bg-orange)'
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col gap-[6px]">
    <label :for="id" class="text-[13px] leading-normal font-medium">{{ label }}</label>

    <textarea
      v-if="as === 'textarea'"
      :id="id"
      v-model="model"
      v-bind="$attrs"
      :class="[control, 'h-[96px] resize-none py-[12px]']"
    ></textarea>

    <div v-else-if="as === 'select'" class="group relative">
      <select
        :id="id"
        v-model="model"
        v-bind="$attrs"
        :class="[control, 'h-[44px] appearance-none pr-[36px]']"
      >
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <span
        class="material-symbols-outlined pointer-events-none absolute top-1/2 right-[10px] -translate-y-1/2 text-[18px]! text-(--text-muted) transition-colors group-focus-within:text-(--bg-orange)"
        aria-hidden="true"
        >unfold_more</span
      >
    </div>

    <input
      v-else
      :id="id"
      v-model="model"
      :type="type"
      v-bind="$attrs"
      :class="[control, 'h-[44px]']"
    />

    <p v-if="hint" class="text-[12px] leading-normal text-(--text-muted)">{{ hint }}</p>
  </div>
</template>
