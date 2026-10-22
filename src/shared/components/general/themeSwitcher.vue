<script setup lang="ts">
import { useTheme } from '@/app/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button @click="toggleTheme">
    <span
      :class="[
        'material-symbols-outlined cursor-pointer transition-all duration-300 ease-out text-(--text-primary) dark:text-(--text-inverse) mt-1',
        isDark ? 'scale-90 rotate-180 lg:scale-120' : 'scale-100 rotate-360 lg:scale-120',
      ]"
    >
      {{ isDark ? 'sunny' : 'bedtime' }}
    </span>
  </button>
</template>
