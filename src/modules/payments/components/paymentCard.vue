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
    class="rounded-2xl border border-(--border-default) bg-(--surface) p-6 sm:p-8 dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
  >
    <header v-if="title" class="mb-1">
      <h3 class="text-lg leading-7 font-semibold">{{ title }}</h3>
      <p
        v-if="description"
        class="mt-1 text-sm leading-6 text-(--text-secondary) dark:text-(--text-inverse-muted)"
      >
        {{ description }}
      </p>
    </header>

    <slot />
  </section>
</template>
