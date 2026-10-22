<script setup lang="ts">
import '../auth.css'

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
</script>

<template>
  <div
    :class="[
      '-mt-15 grid lg:grid-cols-[minmax(0,1fr)_36vw]',
      props.compact ? 'h-dvh overflow-hidden' : 'min-h-dvh',
    ]"
  >
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

    <aside
      class="auth-aside sticky top-0 hidden min-h-dvh flex-col justify-end overflow-hidden bg-(--background-inverse) p-6 text-(--text-inverse) xl:p-9 lg:flex"
    >
      <figure>
        <blockquote class="text-[24px] font-semibold leading-7.5 tracking-[-0.01em]">
          “Mostre o que você está construindo e receba retorno de quem também escreve código todo
          dia.”
        </blockquote>
        <figcaption class="mt-8 text-[14px] text-(--text-inverse-muted)">
          Comunidade ResenhaCoders
        </figcaption>
      </figure>
    </aside>
  </div>
</template>
