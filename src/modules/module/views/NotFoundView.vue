<script setup lang="ts"></script>

<template>
  <section class="px-4 sm:px-6 md:px-12 xl:px-20 py-22">
    <div
      class="mx-auto flex min-h-[70dvh] w-full max-w-8xl flex-col items-center justify-center overflow-hidden rounded-2xl bg-(--surface-container) px-5 py-12 text-center shadow-2xl dark:bg-(--surface-dark) sm:px-8 sm:py-16 md:px-12 lg:min-h-170 lg:px-20"
    >
      <h3
        class="bg-linear-to-r from-(--primary) to-(--primary-container) bg-clip-text text-5xl leading-none font-bold text-transparent sm:text-6xl md:text-7xl dark:to-(--primary-dark) dark:from-(--primary-container-dark)"
      >
        404
      </h3>

      <h2 class="my-4 w-full max-w-2xl text-2xl font-bold sm:text-3xl md:text-4xl">
        Ops! Parece que esta rota saiu do radar logístico.
      </h2>

      <p
        class="w-full max-w-3xl text-sm text-(--on-surface-variant) dark:text-(--on-surface-variant-dark)"
      >
        A página ou recurso que você tentou acessar não existe, foi movida para outro endereço ou
        sua URL expirou. Mas não se preocupe: sua telemetria operacional continua ativa e
        rastreável.
      </p>

      <RouterLink
        to="/"
        class="group mt-8 flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-(--primary) px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-(--primary)/80 active:bg-(--primary)/80 sm:mt-10"
      >
        <span
          class="material-symbols-outlined transition-transform duration-300 group-hover:-translate-x-1"
        >
          home
        </span>
        Voltar ao início
      </RouterLink>
    </div>
  </section>
</template>
