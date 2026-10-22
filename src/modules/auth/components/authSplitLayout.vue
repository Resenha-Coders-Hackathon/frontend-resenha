<script setup lang="ts">
import '../auth.css'

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
</script>

<template>
  <div
    :class="[
      '-mt-[3.75rem] grid lg:grid-cols-[minmax(0,1fr)_36vw]',
      props.compact ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]',
    ]"
  >
    <div
      :class="[
        'flex flex-col px-[16px] pt-[3.75rem] pb-[32px] sm:px-[48px]',
        props.compact ? 'h-[100dvh]' : 'min-h-[100dvh]',
      ]"
    >
      <div
        :class="[
          'flex flex-1 items-center justify-center',
          props.compact ? 'min-h-0 py-[8px]' : 'py-[48px]',
        ]"
      >
        <div
          :class="[
            'w-full max-w-[400px]',
            props.compact ? 'max-h-full overflow-y-auto' : '',
          ]"
        >
          <slot />
        </div>
      </div>

      <footer class="text-[12px] text-(--text-muted)">© 2026 ResenhaCoders</footer>
    </div>

    <aside
      class="auth-aside sticky top-0 hidden min-h-[100dvh] flex-col justify-end overflow-hidden bg-(--background-inverse) p-[24px] text-(--text-inverse) xl:p-[36px] lg:flex"
    >
      <figure>
        <blockquote class="text-[24px] font-semibold leading-[30px] tracking-[-0.01em]">
          “Mostre o que você está construindo e receba retorno de quem também escreve código todo
          dia.”
        </blockquote>
        <figcaption class="mt-[32px] text-[14px] text-(--text-inverse-muted)">
          Comunidade ResenhaCoders
        </figcaption>
      </figure>
    </aside>
  </div>
</template>
