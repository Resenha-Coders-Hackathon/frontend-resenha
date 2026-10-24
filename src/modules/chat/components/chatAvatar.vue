<script setup lang="ts">
import { computed } from 'vue'
import { avatarColor, initials } from '../utils'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number
    // "self" usa a cor de tinta (usuário atual); "ai" é o avatar do assistente
    variant?: 'default' | 'self' | 'ai'
    online?: boolean | null
  }>(),
  { size: 32, variant: 'default', online: null },
)

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${Math.round(props.size * 0.36)}px`,
  ...(props.variant === 'default' ? { backgroundColor: avatarColor(props.name) } : {}),
}))
</script>

<template>
  <span
    :class="[
      'relative grid shrink-0 place-items-center rounded-full leading-none font-semibold text-white',
      variant === 'self'
        ? 'bg-(--text-primary) dark:bg-(--text-inverse) dark:text-(--text-primary)'
        : '',
      variant === 'ai' ? 'rounded-[10px]! bg-(--chat-ai)' : '',
    ]"
    :style="style"
    aria-hidden="true"
  >
    <span
      v-if="variant === 'ai'"
      class="material-symbols-outlined"
      :style="{ fontSize: `${size * 0.55}px` }"
      >auto_awesome</span
    >
    <template v-else>{{ initials(name) }}</template>
    <span
      v-if="online"
      class="absolute -right-px -bottom-px size-[9px] rounded-full bg-[#1e9e5a] ring-2 ring-(--bg-subtle) dark:ring-(--surface-inverse)"
    ></span>
  </span>
</template>
