<script setup lang="ts">
import { SelectorPillTab, GoogleButton } from '../components'
</script>

<template>
  <section class="px-10 py-5">
    <div class="flex h-170 w-full rounded-2xl overflow-hidden">
      <div
        style="
          background-image: url(/auth.svg);
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
        "
        class="h-screen w-[35%] px-10 py-20"
      >
        <h2 class="text-(--surface-container)">
          A logística inteligente
          <span
            class="bg-linear-to-r from-(--primary) to-(--primary-container) bg-clip-text text-transparent dark:to-(--primary-dark) dark:from-(--primary-container-dark)"
            >começa aqui.</span
          >
        </h2>
        <p class="text-(--surface-container) text-sm mt-4">
          Plataforma preditiva com telemetria avançada, governança de ponta a ponta e automação em
          tempo real para frotas e embarcadores de alta performance.
        </p>
      </div>

      <div class="h-screen w-[65%] px-10 py-20">
        <h2>Bem-vindo de volta!</h2>
        <p class="mt-2 dark:text-(--on-surface-variant-dark)">
          Acesse seu workspace corporativo LogiFlow e gerencie suas operações.
        </p>

        <SelectorPillTab />

        <GoogleButton />

        <div class="relative flex items-center justify-center py-1 mt-8">
          <span
            class="w-full h-0.5 bg-(--surface-container-low) dark:bg-(--surface-container-low-dark)"
          />
          <p
            class="absolute px-3 py-1 bg-(--surface) dark:bg-(--surface-dark) text-xs text-on-surface-variant uppercase tracking-wider"
          >
            ou com e-mail
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
