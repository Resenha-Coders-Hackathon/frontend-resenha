<script setup lang="ts">
import { TopbarComp } from '@/shared/components'
import '../payments.css'

withDefaults(defineProps<{ crumbs: string[]; title?: string; description?: string }>(), {
  title: '',
  description: '',
})
</script>

<template>
  <div
    class="flex min-h-[calc(100dvh-3.5rem)] w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp :crumbs="crumbs" has-notifications />

    <section
      class="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-[20px] px-[16px] pt-[24px] pb-[40px] sm:px-[28px]"
    >
      <slot name="top" />
      <header v-if="title" class="flex flex-col gap-[4px] leading-normal">
        <h1 class="text-[26px]! leading-normal! font-semibold! tracking-[-0.65px]!">{{ title }}</h1>
        <p
          v-if="description"
          class="max-w-[640px] text-[14px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
        >
          {{ description }}
        </p>
      </header>
      <slot />
    </section>
  </div>
</template>
