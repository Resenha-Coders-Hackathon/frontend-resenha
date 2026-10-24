<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton, TopbarComp } from '@/shared/components'
import { useAuthStore } from '@/modules/auth'
import { ensureGoogleConnected } from '@/modules/calendar_sync'
import { useOrganizationsStore } from '@/modules/organizations'
import {
  ChatAvatar,
  ChatChannelItem,
  ChatComposer,
  ChatDayDivider,
  ChatMessageItem,
  ChatPanelLayout,
  ChatSectionTitle,
  ChatToolButton,
  ChatTyping,
} from '../components'
import { useChatSocket } from '../composables/useChatSocket'
import { useChatStore } from '../stores/chat'
import type { ChatChannel, ChatMessage, DemoMessage } from '../types'
import { formatDayLabel } from '../utils'

const router = useRouter()
const auth = useAuthStore()
const organizations = useOrganizationsStore()
const chat = useChatStore()
const draft = ref('')
const scroller = useTemplateRef<HTMLElement>('scroller')

const me = computed(() => auth.user?.id)
const organization = computed(() => organizations.current)
// os eventos são tratados pelo layout (useChatAlerts); aqui só enviamos "digitando"
const { sendTyping } = useChatSocket()

const EMPTY_CHANNEL: ChatChannel = {
  id: '',
  kind: 'organization',
  name: '',
  team_id: null,
  team_ids: [],
  sector_id: null,
  unread_count: 0,
  member_count: 0,
  online: null,
  last_message: null,
}

const sectors = computed(() => chat.channels.filter((channel) => channel.kind !== 'direct'))
const directs = computed(() => chat.channels.filter((channel) => channel.kind === 'direct'))
const activeId = computed(() => chat.activeId ?? '')
const active = computed(() => chat.channels.find((c) => c.id === chat.activeId) ?? EMPTY_CHANNEL)
const typing = computed(() => chat.typing[activeId.value])
const items = computed(() => chat.messages[activeId.value] ?? [])

const subtitle = computed(() =>
  active.value.kind === 'direct'
    ? active.value.online
      ? 'Online agora'
      : 'Offline'
    : `${active.value.member_count} membros`,
)

// a API não manda o código da tarefa, só o card precisa dele
function toView(message: ChatMessage): DemoMessage {
  return {
    ...message,
    task: message.task && { ...message.task, code: `#${message.task.id.slice(0, 4)}` },
  }
}

// agrupa as mensagens por dia para mostrar os divisores "Ontem" / "Hoje"
const groups = computed(() => {
  const result: { label: string; items: DemoMessage[] }[] = []
  for (const item of items.value) {
    const label = formatDayLabel(item.created_at)
    const last = result.at(-1)
    if (last?.label === label) last.items.push(toView(item))
    else result.push({ label, items: [toView(item)] })
  }
  return result
})

async function scrollToEnd() {
  await nextTick()
  scroller.value?.parentElement?.scrollTo({ top: scroller.value.parentElement.scrollHeight })
}

function select(channel: ChatChannel) {
  void chat.select(channel.id)
}

// @menção: sugere membros da organização enquanto você digita "@nome"
const mentioned = ref(new Map<string, string>()) // id -> nome
const mentionQuery = computed(() => /(?:^|\s)@([^\s@]*)$/.exec(draft.value)?.[1] ?? null)
const mentionOptions = computed(() => {
  const query = mentionQuery.value?.toLowerCase()
  if (query === undefined) return []
  return organizations.members
    .filter((m) => m.user_id !== auth.user?.id && m.name.toLowerCase().includes(query))
    .slice(0, 6)
})

function startMention() {
  if (mentionQuery.value === null)
    draft.value += `${draft.value && !/\s$/.test(draft.value) ? ' ' : ''}@`
}

function pickMention(member: { user_id: string; name: string }) {
  draft.value = draft.value.replace(/@[^\s@]*$/, `@${member.name} `)
  mentioned.value.set(member.user_id, member.name)
}

const MAX_FILES = 5 // limites do backend
const MAX_BYTES = 10 * 1024 * 1024
const files = ref<File[]>([])
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

function pickFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const picked = [...(input.files ?? [])]
  input.value = ''
  if (files.value.length + picked.length > MAX_FILES)
    return void toast.error(`Envie no máximo ${MAX_FILES} arquivos por mensagem.`)
  if (picked.some((file) => file.size > MAX_BYTES))
    return void toast.error('Cada arquivo pode ter no máximo 10 MB.')
  files.value.push(...picked)
}

async function send() {
  const content = draft.value
  const attached = files.value
  if (!content.trim() && !attached.length) return
  const mentions = [...mentioned.value].filter(([, name]) => content.includes(`@${name}`))
  draft.value = ''
  files.value = []
  mentioned.value = new Map()
  await chat.send(content, { files: attached, mentions: mentions.map(([id]) => id) })
}

// O Meet não pode ser embutido em iframe (o Google bloqueia), então abre numa janelinha no canto.
// A janela é aberta no clique, antes dos awaits, para o navegador não bloquear o popup.
function openMeetWindow(): Window | null {
  const width = 460
  const height = 640
  const left = Math.max(0, window.screenX + window.outerWidth - width - 16)
  const top = Math.max(0, window.screenY + window.outerHeight - height - 48)
  return window.open(
    '',
    'resenha-meet',
    `popup=yes,width=${width},height=${height},left=${left},top=${top}`,
  )
}

async function startMeet() {
  const popup = openMeetWindow()
  let navigated = false
  try {
    if (!(await ensureGoogleConnected({ returnTo: '/chat' }))) return // foi para o Google conectar a conta
    const { link, error } = await chat.meet()
    if (error) throw new Error(error)
    if (link && popup) {
      popup.location.href = link
      navigated = true
    } else if (link) window.open(link, '_blank', 'noopener') // popup bloqueado: abre em nova aba
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Não foi possível iniciar o Meet.')
  } finally {
    // sem link (erro, ou indo conectar o Google) não deixa uma janela vazia aberta
    if (popup && !navigated) popup.close()
  }
}

let lastTyping = 0
watch(draft, (value) => {
  if (!value || !chat.activeId || Date.now() - lastTyping < 2000) return
  lastTyping = Date.now()
  sendTyping(chat.activeId)
})

async function init() {
  if (!auth.user) await auth.loadUser() // a full reload on /chat has no user yet
  if (!organizations.organizations.length) await organizations.load()
  const org = organization.value
  if (!org || !me.value) return
  chat.reset() // never show another account's conversations
  await organizations.loadMembers(org.id)
  const others = organizations.members.map((m) => m.user_id).filter((id) => id !== me.value)
  await chat.load(org.id, others)
}

onMounted(init)

// trocou a organização selecionada: o chat passa a ser o dela
watch(
  () => organization.value?.id,
  (id, previous) => {
    if (previous && id && id !== previous) void init()
  },
)

watch(() => [chat.activeId, items.value.length], scrollToEnd, { immediate: true })
</script>

<template>
  <div
    class="flex h-[calc(100dvh-3.75rem)] md:h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp
      :crumbs="['Mensagens', active.kind === 'direct' ? active.name : `#${active.name}`]"
    />

    <div
      class="flex min-h-0 flex-1 flex-col px-[20px] py-[12px] sm:px-[32px] sm:py-[20px] lg:px-[40px] lg:py-[28px]"
    >
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
            class="grid size-[32px] shrink-0 place-items-center rounded-[9px] border border-(--bg-orange)/25 bg-(--bg-orange)/[0.08] text-(--bg-orange) dark:bg-(--bg-orange)/15"
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
            variant="primary"
            label="Iniciar Meet"
            icon="videocam"
            icon-position="left"
            size="sm"
            :full-width="false"
            @click="startMeet"
            class="mt-0! hidden rounded-[10px]! h-[34px]! gap-[6px]! px-[12px]! py-0! text-[13px]! [&_.material-symbols-outlined]:text-[17px]! sm:inline-flex"
          />
          <button
            type="button"
            class="grid size-[34px] shrink-0 cursor-pointer place-items-center rounded-[10px] border border-(--border-default) transition-all duration-200 hover:-translate-y-0.5 hover:border-(--bg-orange)/35 hover:bg-(--bg-orange)/5 hover:text-(--bg-orange) active:translate-y-0 dark:border-(--border-inverse) dark:hover:bg-(--bg-orange)/10"
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
              :own="item.author_id === me"
            />
          </template>
          <p v-if="!groups.length" class="py-[40px] text-center text-[13px] text-(--text-muted)">
            Nenhuma mensagem ainda. Comece a conversa!
          </p>
          <ChatTyping v-if="typing" :name="typing" />
        </div>

        <template #footer>
          <ul
            v-if="mentionOptions.length"
            class="mb-[6px] grid gap-[2px] rounded-[10px] border border-(--border-default) bg-(--surface) p-[4px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
            role="listbox"
            aria-label="Mencionar membro"
          >
            <li v-for="member in mentionOptions" :key="member.user_id" role="option">
              <button
                type="button"
                class="flex w-full cursor-pointer items-center gap-[8px] rounded-[7px] px-[8px] py-[6px] text-left text-[13px] transition-colors hover:bg-(--bg-orange)/5 hover:text-(--bg-orange) dark:hover:bg-(--bg-orange)/10"
                @click="pickMention(member)"
              >
                <ChatAvatar :name="member.name" :size="24" />
                {{ member.name }}
              </button>
            </li>
          </ul>
          <ChatComposer
            v-model="draft"
            :placeholder="`Mensagem para ${active.kind === 'direct' ? active.name : `#${active.name}`} · use @ para mencionar e # para citar uma tarefa`"
            submit-label="Enviar"
            submit-icon="chat_bubble"
            @submit="send"
          >
            <template #tools>
              <input
                ref="fileInput"
                type="file"
                multiple
                class="sr-only"
                tabindex="-1"
                aria-label="Arquivos da mensagem"
                @change="pickFiles"
              />
              <ChatToolButton
                icon="attach_file"
                label="Anexar arquivo"
                @click="fileInput?.click()"
              />
              <span
                v-for="(file, index) in files"
                :key="index"
                class="flex max-w-[160px] items-center gap-[4px] rounded-[6px] bg-(--bg-subtle) py-[2px] pr-[2px] pl-[8px] text-[12px] dark:bg-white/10"
              >
                <span class="truncate">{{ file.name }}</span>
                <button
                  type="button"
                  class="grid size-[20px] cursor-pointer place-items-center"
                  :aria-label="`Remover ${file.name}`"
                  @click="files.splice(index, 1)"
                >
                  <span class="material-symbols-outlined text-[14px]!" aria-hidden="true"
                    >close</span
                  >
                </button>
              </span>
              <ChatToolButton
                icon="alternate_email"
                label="Mencionar alguém"
                @click="startMention"
              />
              <button
                type="button"
                class="ml-[4px] flex h-[30px] cursor-pointer items-center gap-[6px] rounded-[8px] border border-(--border-default) px-[10px] text-[12.5px] font-medium transition-all duration-200 hover:border-(--bg-orange)/35 hover:bg-(--bg-orange)/5 hover:text-(--bg-orange) dark:border-(--border-inverse) dark:hover:bg-(--bg-orange)/10"
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
