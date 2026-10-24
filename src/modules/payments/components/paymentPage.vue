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
    class="flex min-h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp :crumbs="crumbs" />

    <section
      class="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-[20px] px-[20px] pt-[24px] pb-[40px] sm:px-[36px]"
    >
      <slot name="top" />
      <header
        v-if="title"
        class="relative flex flex-col gap-[4px] pl-[13px] leading-normal before:absolute before:top-[3px] before:bottom-[3px] before:left-0 before:w-[3px] before:rounded-full before:bg-(--bg-orange)"
      >
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
