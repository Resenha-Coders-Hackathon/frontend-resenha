<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton } from '@/shared/components'
import {
  ChatChannelItem,
  ChatComposer,
  ChatDayDivider,
  ChatMessageItem,
  ChatPanelLayout,
  ChatSectionTitle,
  ChatToolButton,
  ChatTopbar,
  ChatTyping,
} from '../components'
import type { ChatChannel, DemoMessage } from '../types'
import { formatDayLabel } from '../utils'
import { CHANNELS, CURRENT_USER, MESSAGES, TYPING } from '../utils/mocks'

// Página só de interface: as mensagens enviadas ficam locais, sem backend.

const router = useRouter()
const search = ref('')
const channels = ref<ChatChannel[]>(structuredClone(CHANNELS))
const messages = ref<Record<string, DemoMessage[]>>(structuredClone(MESSAGES))
const activeId = ref('marketing')
const draft = ref('')
const scroller = useTemplateRef<HTMLElement>('scroller')

const sectors = computed(() => channels.value.filter((channel) => channel.kind !== 'direct'))
const directs = computed(() => channels.value.filter((channel) => channel.kind === 'direct'))
const active = computed(() => channels.value.find((channel) => channel.id === activeId.value)!)
const typing = computed(() => TYPING[activeId.value])

const subtitle = computed(() =>
  active.value.kind === 'direct'
    ? active.value.online
      ? 'Online agora'
      : 'Offline'
    : `${active.value.member_count} membros · Board: Sprint de Outubro`,
)

// agrupa as mensagens por dia para mostrar os divisores "Ontem" / "Hoje"
const groups = computed(() => {
  const result: { label: string; items: DemoMessage[] }[] = []
  for (const item of messages.value[activeId.value] ?? []) {
    const label = formatDayLabel(item.created_at)
    const last = result.at(-1)
    if (last?.label === label) last.items.push(item)
    else result.push({ label, items: [item] })
  }
  return result
})

async function scrollToEnd() {
  await nextTick()
  scroller.value?.parentElement?.scrollTo({ top: scroller.value.parentElement.scrollHeight })
}

function select(channel: ChatChannel) {
  activeId.value = channel.id
  channel.unread_count = 0
}

function send() {
  const content = draft.value.trim()
  if (!content) return
  const created = new Date().toISOString()
  const list = (messages.value[activeId.value] ??= [])
  list.push({
    id: `local-${Date.now()}`,
    channel_id: activeId.value,
    author_id: CURRENT_USER.id,
    author_name: CURRENT_USER.name,
    content,
    reply_to_id: null,
    task: null,
    mentions: [],
    attachments: [],
    created_at: created,
    edited_at: null,
    deleted_at: null,
  })
  active.value.last_message = {
    id: `lm-${Date.now()}`,
    author_name: CURRENT_USER.name,
    content: active.value.kind === 'direct' ? `Você: ${content}` : content,
    has_attachments: false,
    created_at: created,
  }
  draft.value = ''
}

watch(() => [activeId.value, messages.value[activeId.value]?.length], scrollToEnd, {
  immediate: true,
})
</script>

<template>
  <div class="flex h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)">
    <ChatTopbar
      v-model:search="search"
      :crumbs="[
        'Norte Studio',
        'Mensagens',
        active.kind === 'direct' ? active.name : `#${active.name}`,
      ]"
      has-notifications
    />

    <div class="flex min-h-0 flex-1 flex-col p-[12px] sm:p-[20px] lg:p-[28px]">
      <ChatPanelLayout>
        <template #aside>
          <h2
            class="px-[18px] pt-[18px] text-[17px]! leading-normal! font-semibold! tracking-normal!"
          >
            Mensagens
          </h2>

          <ChatSectionTitle>Canais por setor</ChatSectionTitle>
          <nav aria-label="Canais por setor" class="flex flex-col gap-[2px]">
            <ChatChannelItem
              v-for="channel in sectors"
              :key="channel.id"
              :channel="channel"
              :active="channel.id === activeId"
              @select="select(channel)"
            />
          </nav>

          <ChatSectionTitle>Mensagens diretas</ChatSectionTitle>
          <nav aria-label="Mensagens diretas" class="flex flex-col gap-[2px] pb-[12px]">
            <ChatChannelItem
              v-for="channel in directs"
              :key="channel.id"
              :channel="channel"
              :active="channel.id === activeId"
              @select="select(channel)"
            />
          </nav>
        </template>

        <template #header>
          <span
            v-if="active.kind !== 'direct'"
            class="grid size-[32px] shrink-0 place-items-center rounded-[9px] bg-(--bg-subtle) text-(--text-secondary) dark:bg-black/30 dark:text-(--text-inverse-muted)"
            aria-hidden="true"
          >
            <span class="material-symbols-outlined text-[18px]!">tag</span>
          </span>
          <div class="flex min-w-0 flex-1 flex-col leading-normal">
            <h1 class="truncate text-[15px]! leading-normal! font-semibold! tracking-normal!">
              {{ active.name }}
            </h1>
            <p class="truncate text-[12px] text-(--text-muted)">{{ subtitle }}</p>
          </div>
          <BaseButton
            variant="secondary"
            label="Iniciar Meet"
            icon="videocam"
            icon-position="left"
            size="sm"
            :full-width="false"
            class="mt-0! hidden rounded-[10px]! h-[34px]! gap-[6px]! px-[12px]! py-0! text-[13px]! [&_.material-symbols-outlined]:text-[17px]! sm:inline-flex"
          />
          <button
            type="button"
            class="grid size-[34px] shrink-0 cursor-pointer place-items-center rounded-[10px] border border-(--border-default) transition-colors hover:bg-(--bg-subtle) dark:border-(--border-inverse) dark:hover:bg-white/10"
            aria-label="Mais opções do canal"
          >
            <span class="material-symbols-outlined text-[18px]!" aria-hidden="true"
              >more_horiz</span
            >
          </button>
        </template>

        <div ref="scroller" aria-live="polite">
          <template v-for="group in groups" :key="group.label">
            <ChatDayDivider :label="group.label" />
            <ChatMessageItem
              v-for="item in group.items"
              :key="item.id"
              :message="item"
              :own="item.author_id === CURRENT_USER.id"
            />
          </template>
          <p v-if="!groups.length" class="py-[40px] text-center text-[13px] text-(--text-muted)">
            Nenhuma mensagem ainda. Comece a conversa!
          </p>
          <ChatTyping v-if="typing" :name="typing" />
        </div>

        <template #footer>
          <ChatComposer
            v-model="draft"
            :placeholder="`Mensagem para ${active.kind === 'direct' ? active.name : `#${active.name}`} · use @ para mencionar e # para citar uma tarefa`"
            submit-label="Enviar"
            submit-icon="chat_bubble"
            @submit="send"
          >
            <template #tools>
              <ChatToolButton icon="attach_file" label="Anexar arquivo" />
              <ChatToolButton icon="alternate_email" label="Mencionar alguém" />
              <button
                type="button"
                class="ml-[4px] flex h-[30px] cursor-pointer items-center gap-[6px] rounded-[8px] border border-(--border-default) px-[10px] text-[12.5px] font-medium transition-colors hover:bg-(--bg-subtle) dark:border-(--border-inverse) dark:hover:bg-white/10"
                @click="router.hasRoute('Assistant') && router.push({ name: 'Assistant' })"
              >
                <span
                  class="material-symbols-outlined text-[16px]! text-(--chat-ai)"
                  aria-hidden="true"
                  >auto_awesome</span
                >
                Criar tarefas com IA
              </button>
            </template>
          </ChatComposer>
        </template>
      </ChatPanelLayout>
    </div>
  </div>
</template>
