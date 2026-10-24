<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{ id: string; label: string; icon?: string; hint?: string }>(), {
  icon: '',
  hint: '',
})

const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col gap-[6px]">
    <label :for="id" class="text-[13px] leading-normal font-medium">{{ label }}</label>
    <div
      class="flex h-[44px] items-center gap-[8px] rounded-[10px] border border-(--border-default) bg-(--surface) px-[12px] text-(--text-muted) transition-[border-color,box-shadow,color] focus-within:border-(--bg-orange) focus-within:text-(--bg-orange) focus-within:shadow-[0_0_0_3px_rgb(255_103_0/0.12)] dark:border-(--border-inverse) dark:bg-black/30"
    >
      <span v-if="icon" class="material-symbols-outlined text-[18px]!" aria-hidden="true">{{
        icon
      }}</span>
      <input
        :id="id"
        v-model="model"
        v-bind="$attrs"
        class="h-full min-w-0 flex-1 bg-transparent text-[14px] leading-5 text-(--text-primary) outline-none placeholder:text-(--text-muted) read-only:text-(--text-secondary) dark:text-(--text-inverse)"
      />
      <slot name="suffix" />
    </div>
    <p v-if="hint" class="text-[12px] leading-normal text-(--text-muted)">{{ hint }}</p>
  </div>
</template>
