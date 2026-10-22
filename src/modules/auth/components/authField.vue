<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    id: string
    label: string
    icon: string
    type?: string
    hint?: string
  }>(),
  { type: 'text', hint: '' },
)

const model = defineModel<string>({ default: '' })
</script>

<template>
  <div>
    <label :for="id" class="mb-2 block text-[14px] font-medium leading-5">{{ label }}</label>
    <div
      class="flex h-13 items-center gap-3 rounded-lg border border-(--border-default) bg-(--surface) px-4 text-(--text-muted) transition-colors focus-within:border-(--border-strong) dark:border-(--border-inverse) dark:bg-black/30 dark:focus-within:border-(--text-inverse-muted)"
    >
      <span class="material-symbols-outlined text-[20px]!" aria-hidden="true">{{ icon }}</span>
      <input
        :id="id"
        v-model="model"
        :type="type"
        v-bind="$attrs"
        class="auth-input h-full w-full bg-transparent text-[16px] text-(--text-primary) outline-none placeholder:text-(--text-muted) dark:text-(--text-inverse)"
      />
    </div>
    <slot name="after" />
    <p
      v-if="hint"
      class="mt-2 text-[12px] leading-4 text-(--text-secondary) dark:text-(--text-inverse-muted)"
    >
      {{ hint }}
    </p>
  </div>
</template>

<style scoped>
.auth-input:-webkit-autofill,
.auth-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--text-primary);
  transition: background-color 9999s;
}

.dark .auth-input:-webkit-autofill,
.dark .auth-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--text-inverse);
}
</style>
