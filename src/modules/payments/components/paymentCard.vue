<script setup lang="ts">
interface Props {
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
})
</script>

<template>
  <section
    class="flex flex-col gap-[14px] rounded-[16px] border border-(--border-default) bg-(--surface) p-[18px] sm:p-[22px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
  >
    <header v-if="title" class="flex flex-col gap-[2px] leading-normal">
      <h2
        class="border-l-2 border-(--bg-orange) pl-[9px] text-[15px]! leading-normal! font-semibold! tracking-normal!"
      >
        {{ title }}
      </h2>
      <p
        v-if="description"
        class="text-[13px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
      >
        {{ description }}
      </p>
    </header>

    <slot />
  </section>
</template>
