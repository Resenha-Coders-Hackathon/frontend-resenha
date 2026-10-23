<script setup lang="ts">
import ChatAvatar from './chatAvatar.vue'

defineProps<{ name: string }>()
</script>

<template>
  <p
    class="flex items-center gap-[8px] py-[6px] text-[12px] leading-normal text-(--text-muted)"
    aria-live="polite"
  >
    <ChatAvatar :name="name" :size="20" />
    <span class="flex gap-[3px]" aria-hidden="true">
      <span
        v-for="dot in 3"
        :key="dot"
        class="chat-typing-dot size-[5px] rounded-full bg-(--text-muted)"
        :style="{ animationDelay: `${dot * 150}ms` }"
      ></span>
    </span>
    {{ name.split(' ')[0] }} está digitando…
  </p>
</template>

<style scoped>
.chat-typing-dot {
  animation: chat-typing 1.2s ease-in-out infinite;
}

@keyframes chat-typing {
  0%,
  60%,
  100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chat-typing-dot {
    animation: none;
  }
}
</style>
