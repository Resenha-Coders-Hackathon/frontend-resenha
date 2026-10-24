<script setup lang="ts">
import { computed } from 'vue'
import type { DemoAttachment } from '../types'
import { formatSize } from '../utils'

const props = defineProps<{ file: DemoAttachment }>()

const details = computed(() => {
  const type = props.file.mime_type.split('/').pop()?.toUpperCase() ?? 'ARQUIVO'
  return [
    type,
    props.file.pages ? `${props.file.pages} páginas` : '',
    formatSize(props.file.size_bytes),
  ]
    .filter(Boolean)
    .join(' · ')
})
</script>

<template>
  <a
    :href="file.url"
    target="_blank"
    rel="noopener noreferrer"
    class="flex w-fit max-w-full items-center gap-[10px] rounded-[10px] border border-(--border-default) bg-(--surface) py-[8px] pr-[14px] pl-[8px] transition-colors hover:border-(--text-muted) dark:border-(--border-inverse) dark:bg-black/20"
  >
    <span
      class="grid size-[32px] shrink-0 place-items-center rounded-[8px] bg-[#e8efff] text-[#2563eb] dark:bg-[#2563eb]/20 dark:text-[#8fb1ff]"
    >
      <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">description</span>
    </span>
    <span class="flex min-w-0 flex-col leading-normal">
      <span class="truncate text-[13px] font-medium">{{
        file.file_name.replace(/\.\w+$/, '')
      }}</span>
      <span class="text-[11.5px] text-(--text-muted)">{{ details }}</span>
    </span>
  </a>
</template>
