<script setup lang="ts">
import { computed } from 'vue'
import type { DemoMessage } from '../types'
import { formatTime } from '../utils'
import ChatAttachmentCard from './chatAttachmentCard.vue'
import ChatAvatar from './chatAvatar.vue'
import ChatTaskCard from './chatTaskCard.vue'

const props = defineProps<{ message: DemoMessage; own: boolean }>()

// separa o texto nas menções (@Nome) para destacá-las
const parts = computed(() => {
  const names = props.message.mentions.map((mention) => `@${mention.name}`)
  if (!names.length) return [{ text: props.message.content, mention: false }]
  const pattern = new RegExp(
    `(${names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
  )
  return props.message.content
    .split(pattern)
    .filter(Boolean)
    .map((text) => ({ text, mention: names.includes(text) }))
})
</script>

<template>
  <article v-if="own" class="flex justify-end gap-[10px] py-[6px]">
    <div class="flex max-w-[min(560px,85%)] flex-col items-end gap-[6px]">
      <p class="text-[11.5px] leading-normal text-(--text-muted)">
        Você · {{ formatTime(message.created_at) }}
      </p>
      <p
        class="rounded-[12px] rounded-tr-[4px] bg-(--text-primary) px-[12px] py-[8px] text-[13.5px] leading-[20px] text-white dark:bg-[#2e2c28] dark:text-(--text-inverse)"
      >
        {{ message.content }}
      </p>
      <ChatAttachmentCard v-for="file in message.attachments" :key="file.id" :file="file" />
    </div>
    <ChatAvatar :name="message.author_name" variant="self" :size="36" />
  </article>

  <article v-else class="flex gap-[10px] py-[6px]">
    <ChatAvatar :name="message.author_name" :size="36" />
    <div class="flex min-w-0 flex-1 flex-col gap-[6px]">
      <p class="flex items-baseline gap-[8px] leading-normal">
        <span class="text-[13.5px] font-semibold">{{ message.author_name }}</span>
        <span class="text-[11.5px] text-(--text-muted)">{{ formatTime(message.created_at) }}</span>
      </p>
      <p
        class="max-w-[640px] text-[13.5px] leading-[21px] text-(--text-primary) dark:text-(--text-inverse)"
      >
        <template v-for="(part, index) in parts" :key="index">
          <span v-if="part.mention" class="font-medium text-(--chat-mention)">{{ part.text }}</span>
          <template v-else>{{ part.text }}</template>
        </template>
      </p>
      <ChatTaskCard v-if="message.task" :task="message.task" />
      <ChatAttachmentCard v-for="file in message.attachments" :key="file.id" :file="file" />
    </div>
  </article>
</template>
