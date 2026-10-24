<script setup lang="ts">
defineProps<{
  visible: boolean
  eyebrow: string
  title: string
  highlight: string
  description: string
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="auth-wipe">
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] grid min-h-dvh place-items-center overflow-hidden bg-black px-6 text-center"
        role="status"
        aria-live="polite"
        :aria-label="`${title} ${highlight}`"
      >
        <div
          class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,122,15,0.08),transparent_48%)]"
          aria-hidden="true"
        ></div>

        <div class="auth-loader-content relative flex w-full max-w-sm flex-col items-center">
          <img src="/wordmark-inverse.svg" alt="ResenhaCoders" class="mb-12 w-56" />

          <div class="relative mb-7 grid size-14 place-items-center" aria-hidden="true">
            <span class="absolute inset-0 rounded-full border border-white/10"></span>
            <span
              class="auth-loader-spinner absolute inset-0 rounded-full border-[3px] border-transparent border-t-(--accent-orange) border-r-(--accent-orange)"
            ></span>
            <span class="absolute inset-2 rounded-full border border-(--accent-orange)/20"></span>
            <span
              class="size-2.5 animate-pulse rounded-full bg-(--accent-orange) shadow-[0_0_18px_rgba(255,122,15,0.7)]"
            ></span>
          </div>

          <p
            class="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-(--accent-orange) uppercase"
          >
            <span class="size-1.5 animate-pulse rounded-full bg-(--accent-orange)"></span>
            {{ eyebrow }}
          </p>
          <h2 class="mt-3 text-[22px] leading-7 font-semibold text-white">
            {{ title }} <span class="text-(--accent-orange)">{{ highlight }}</span>
          </h2>
          <p class="mt-2 max-w-xs text-[14px] leading-6 text-white/55">{{ description }}</p>
          <div
            class="auth-loader-progress relative mt-8 h-1 w-36 overflow-hidden rounded-full bg-white/10"
            aria-hidden="true"
          >
            <span
              class="auth-loader-progress-bar absolute inset-y-0 left-0 w-1/3 rounded-full bg-(--accent-orange)"
            ></span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.auth-wipe-enter-active {
  transition: clip-path 560ms cubic-bezier(0.76, 0, 0.24, 1);
}

.auth-wipe-enter-from {
  clip-path: inset(0 0 0 100%);
}

.auth-wipe-enter-to {
  clip-path: inset(0);
}

.auth-wipe-leave-active {
  transition: opacity 180ms ease-out;
}

.auth-wipe-leave-to {
  opacity: 0;
}

.auth-wipe-enter-active .auth-loader-content {
  animation: auth-loader-appear 320ms ease-out 380ms both;
}

.auth-loader-spinner {
  animation: auth-loader-spin 1.1s linear infinite;
}

.auth-loader-progress-bar {
  animation: auth-loader-progress 1.5s ease-in-out infinite;
}

@keyframes auth-loader-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes auth-loader-progress {
  from {
    transform: translateX(-140%);
  }

  to {
    transform: translateX(440%);
  }
}

@keyframes auth-loader-appear {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-wipe-enter-active,
  .auth-wipe-leave-active {
    transition-duration: 1ms;
  }

  .auth-wipe-enter-active .auth-loader-content {
    animation-duration: 1ms;
    animation-delay: 0ms;
  }

  .auth-loader-spinner,
  .auth-loader-progress-bar {
    animation: none;
  }

  .auth-loader-progress-bar {
    width: 100%;
  }
}
</style>
