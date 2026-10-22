<script setup lang="ts">
import '../auth.css'

defineProps<{
  icon: string
  title: string
}>()
</script>

<template>
  <div class="flex min-h-[calc(100dvh-7rem)] flex-col bg-(--bg-subtle) px-[16px] py-[24px] sm:px-[48px] dark:bg-(--background-inverse)">
    <div class="flex flex-1 items-center justify-center py-[48px]">
      <div
        class="w-full max-w-[440px] rounded-[16px] border border-(--border-default) bg-(--surface) p-[24px] text-center sm:p-[40px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
      >
        <span
          class="mx-auto grid size-[56px] place-items-center rounded-full border border-(--border-default) bg-(--bg-subtle) dark:border-(--border-inverse) dark:bg-black/30"
          aria-hidden="true"
        >
          <span class="material-symbols-outlined text-[22px]!">{{ icon }}</span>
        </span>

        <h1 class="mt-[24px] text-[24px]! font-semibold! leading-[32px]! tracking-[-0.02em]!">
          {{ title }}
        </h1>
        <p class="mt-[8px] text-[16px] leading-[26px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
          <slot name="description" />
        </p>

        <div class="mt-[24px] text-left">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
