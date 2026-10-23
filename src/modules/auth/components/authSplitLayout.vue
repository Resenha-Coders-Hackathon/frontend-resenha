<script setup lang="ts">
import '../auth.css'

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
</script>

<template>
    <div :class="['flex flex-col px-4 pt-15 pb-8 sm:px-12', props.compact ? 'h-dvh' : 'min-h-dvh']">
      <div
        :class="[
          'flex flex-1 items-center justify-center',
          props.compact ? 'min-h-0 py-2' : 'py-12',
        ]"
      >
        <div :class="['w-full max-w-100', props.compact ? 'max-h-full overflow-y-auto' : '']">
          <slot />
        </div>
      </div>

      <footer class="text-[12px] text-(--text-muted)">© 2026 ResenhaCoders</footer>
    </div>
</template>
