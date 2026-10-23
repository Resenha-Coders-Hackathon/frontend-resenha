<script setup lang="ts"></script>

<template>
  <section
    class="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-6xl flex-col justify-center px-4 pt-10 sm:px-6 md:px-12 xl:px-20"
  >
    <div
      class="mx-auto flex w-full max-w-8xl flex-col items-center justify-center px-5 py-12 text-center"
    >
      <h3 class="text-7xl leading-none font-bold sm:text-8xl md:text-9xl">404</h3>

      <h2 class="my-4 w-full max-w-2xl text-2xl font-bold sm:text-3xl md:text-4xl">
        Página não encontrada
      </h2>

      <p class="w-full max-w-3xl text-sm text-(--text-muted)">
        O endereço pode ter mudado ou a página não existe mais. Verifique o link ou volte para o
        início.
      </p>

      <RouterLink
        to="/"
        class="mt-8 sm:mt-10 flex w-full text-sm font-semibold justify-center max-w-xs items-center gap-2 group rounded-lg bg-(--background-inverse) text-(--text-inverse) dark:bg-(--text-inverse) dark:text-(--text-primary) px-5 py-3 transition-all duration-300"
      >
        Voltar ao início
        <span
          class="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1"
        >
          home
        </span>
      </RouterLink>
    </div>
  </section>
</template>
