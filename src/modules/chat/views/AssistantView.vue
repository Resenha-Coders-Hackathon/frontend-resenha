<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import { toast } from 'vue-sonner'
import { BaseButton } from '@/shared/components'
import {
  AssistantTaskCard,
  ChatAttachmentCard,
  ChatAvatar,
  ChatComposer,
  ChatPanelLayout,
  ChatSectionTitle,
  ChatToolButton,
  ChatTopbar,
} from '../components'
import type { AssistantEntry } from '../types'
import {
  AI_CREDITS,
  ASSISTANT_CONVERSATION,
  ASSISTANT_HISTORY,
  ASSISTANT_PROMPTS,
  CURRENT_USER,
} from '../utils/mocks'

// Página só de interface: "Gerar tarefas" não chama a IA nem o backend.

const search = ref('')
const activeHistory = ref(ASSISTANT_HISTORY[0]!.id)
const entries = ref<AssistantEntry[]>(structuredClone(ASSISTANT_CONVERSATION))
const addedEntries = ref<string[]>([])
const draft = ref('')
const scroller = useTemplateRef<HTMLElement>('scroller')

const historyTitle = computed(
  () => ASSISTANT_HISTORY.find((item) => item.id === activeHistory.value)?.title ?? 'Nova conversa',
)
const creditsPercent = computed(() => Math.round((AI_CREDITS.used / AI_CREDITS.total) * 100))

function now() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function selectedCount(entry: AssistantEntry) {
  return entry.kind === 'assistant' ? (entry.tasks?.filter((task) => task.selected).length ?? 0) : 0
}

function addToBoard(entry: AssistantEntry) {
  addedEntries.value.push(entry.id)
  toast.success(`${selectedCount(entry)} tarefas adicionadas em A fazer (prévia, sem salvar).`)
}

function openHistory(id: string) {
  activeHistory.value = id
  // só a primeira conversa tem conteúdo de exemplo
  entries.value = id === ASSISTANT_HISTORY[0]!.id ? structuredClone(ASSISTANT_CONVERSATION) : []
}

function newConversation() {
  activeHistory.value = ''
  entries.value = []
  draft.value = ''
}

async function send() {
  const content = draft.value.trim()
  if (!content) return
  entries.value.push(
    { id: `u-${Date.now()}`, kind: 'user', time: now(), content },
    {
      id: `a-${Date.now()}`,
      kind: 'assistant',
      time: now(),
      content: 'Esta é uma prévia da interface: a geração de tarefas ainda não está conectada.',
    },
  )
  draft.value = ''
  await nextTick()
  scroller.value?.parentElement?.scrollTo({
    top: scroller.value.parentElement.scrollHeight,
    behavior: 'smooth',
  })
}
</script>

<template>
  <div class="flex h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)">
    <ChatTopbar
      v-model:search="search"
      :crumbs="['Norte Studio', 'Assistente IA', historyTitle]"
      has-notifications
    />

    <div class="flex min-h-0 flex-1 flex-col p-[12px] sm:p-[20px] lg:p-[28px]">
      <ChatPanelLayout tinted>
        <template #aside>
          <div class="flex items-center gap-[10px] px-[18px] pt-[18px]">
            <ChatAvatar name="Assistente" variant="ai" :size="30" />
            <h2 class="text-[17px]! leading-normal! font-semibold! tracking-normal!">Assistente</h2>
          </div>
          <p
            class="px-[18px] pt-[12px] text-[12.5px] leading-[19px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
          >
            Descreva o que precisa ou anexe um arquivo. A IA sugere tarefas com responsável, prazo e
            setor, e você revisa antes de entrarem no board.
          </p>

          <div
            class="mx-[16px] mt-[16px] flex flex-col gap-[10px] rounded-[12px] border border-(--border-default) bg-(--surface) p-[12px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
          >
            <p class="flex items-center justify-between text-[12px] leading-normal">
              <span>Créditos de IA no mês</span>
              <span class="font-mono text-[11.5px]"
                >{{ AI_CREDITS.used }} / {{ AI_CREDITS.total }}</span
              >
            </p>
            <div
              class="h-[4px] overflow-hidden rounded-full bg-(--bg-muted) dark:bg-black/40"
              role="progressbar"
              :aria-valuenow="AI_CREDITS.used"
              :aria-valuemax="AI_CREDITS.total"
              aria-label="Créditos de IA usados"
            >
              <div
                class="h-full rounded-full bg-(--chat-ai)"
                :style="{ width: `${creditsPercent}%` }"
              ></div>
            </div>
            <p
              class="flex items-center justify-between text-[12px] leading-normal text-(--text-secondary) dark:text-(--text-inverse-muted)"
            >
              <span>Renova em {{ AI_CREDITS.renewsAt }}</span>
              <a
                href="#"
                class="font-mono text-[11.5px] text-(--chat-ai) hover:underline"
                @click.prevent
                >Plano Pro</a
              >
            </p>
          </div>

          <ChatSectionTitle>Histórico</ChatSectionTitle>
          <nav aria-label="Histórico de conversas" class="flex flex-col gap-[2px] pb-[12px]">
            <button
              v-for="item in ASSISTANT_HISTORY"
              :key="item.id"
              type="button"
              :aria-current="item.id === activeHistory ? 'true' : undefined"
              :class="[
                'mx-[8px] cursor-pointer truncate rounded-[9px] px-[10px] py-[8px] text-left text-[13px] leading-normal transition-colors',
                item.id === activeHistory
                  ? 'bg-(--surface) font-medium shadow-[0_1px_3px_rgb(0_0_0/0.08)] dark:bg-(--surface-inverse)'
                  : 'text-(--text-secondary) hover:bg-black/3 dark:text-(--text-inverse-muted) dark:hover:bg-white/5',
              ]"
              @click="openHistory(item.id)"
            >
              {{ item.title }}
            </button>
          </nav>
        </template>

        <template #header>
          <ChatAvatar name="Assistente" variant="ai" :size="32" />
          <div class="flex min-w-0 flex-1 flex-col leading-normal">
            <h1
              class="flex items-center gap-[8px] text-[15px]! leading-normal! font-semibold! tracking-normal!"
            >
              Assistente Fluxa
              <span
                class="rounded-[5px] bg-(--chat-ai-soft) px-[5px] font-mono text-[10px] leading-[16px] font-medium text-(--chat-ai)"
                >PRO</span
              >
            </h1>
            <p class="truncate text-[12px] text-(--text-muted)">
              Gerando para: Marketing · Sprint de Outubro
            </p>
          </div>
          <BaseButton
            variant="secondary"
            label="Nova conversa"
            icon="add"
            icon-position="left"
            size="sm"
            :full-width="false"
            class="mt-0! rounded-[10px]! h-[34px]! gap-[6px]! px-[12px]! py-0! text-[13px]! [&_.material-symbols-outlined]:text-[17px]!"
            @click="newConversation"
          />
        </template>

        <div ref="scroller" class="flex flex-col gap-[18px]" aria-live="polite">
          <div
            v-if="!entries.length"
            class="flex flex-col items-center gap-[10px] py-[60px] text-center"
          >
            <ChatAvatar name="Assistente" variant="ai" :size="44" />
            <p class="text-[15px] font-semibold">Como posso ajudar?</p>
            <p class="max-w-[360px] text-[13px] leading-[20px] text-(--text-muted)">
              Peça tarefas a partir de uma ata, e-mail ou PDF. Você revisa tudo antes de ir para o
              board.
            </p>
          </div>

          <template v-for="entry in entries" :key="entry.id">
            <article v-if="entry.kind === 'user'" class="flex justify-end gap-[10px]">
              <div class="flex max-w-[min(560px,85%)] flex-col items-end gap-[6px]">
                <p class="text-[11.5px] leading-normal text-(--text-muted)">
                  Você · {{ entry.time }}
                </p>
                <p
                  class="rounded-[12px] rounded-tr-[4px] bg-(--text-primary) px-[12px] py-[8px] text-[13.5px] leading-[20px] text-white dark:bg-[#2e2c28] dark:text-(--text-inverse)"
                >
                  {{ entry.content }}
                </p>
                <ChatAttachmentCard v-if="entry.attachment" :file="entry.attachment" />
              </div>
              <ChatAvatar :name="CURRENT_USER.name" variant="self" :size="36" />
            </article>

            <article v-else class="flex gap-[10px]">
              <ChatAvatar name="Assistente" variant="ai" :size="36" />
              <div class="flex min-w-0 flex-1 flex-col gap-[10px]">
                <p class="flex items-baseline gap-[8px] leading-normal">
                  <span class="text-[13.5px] font-semibold">Assistente Fluxa</span>
                  <span class="text-[11.5px] text-(--text-muted)">
                    {{ entry.time }}{{ entry.duration ? ` · ${entry.duration}` : '' }}
                  </span>
                </p>

                <ul
                  v-if="entry.steps"
                  class="flex max-w-[640px] flex-col gap-[6px] rounded-[10px] border border-(--border-default) px-[12px] py-[10px] dark:border-(--border-inverse)"
                >
                  <li
                    v-for="step in entry.steps"
                    :key="step.id"
                    class="flex items-center gap-[8px] text-[12px] leading-normal text-(--text-secondary) dark:text-(--text-inverse-muted)"
                  >
                    <span
                      class="material-symbols-outlined text-[15px]! text-[#1e9e5a]"
                      aria-hidden="true"
                      >check</span
                    >
                    {{ step.label }}
                  </li>
                </ul>

                <p class="max-w-[640px] text-[13.5px] leading-[21px]">{{ entry.content }}</p>

                <div v-if="entry.tasks" class="flex max-w-[640px] flex-col gap-[8px]">
                  <AssistantTaskCard
                    v-for="task in entry.tasks"
                    :key="task.id"
                    v-model:selected="task.selected"
                    :task="task"
                  />
                  <div class="flex flex-wrap items-center gap-[8px] pt-[2px]">
                    <button
                      type="button"
                      :disabled="!selectedCount(entry) || addedEntries.includes(entry.id)"
                      class="flex h-[34px] cursor-pointer items-center gap-[6px] rounded-[9px] bg-(--chat-ai) px-[12px] text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      @click="addToBoard(entry)"
                    >
                      <span class="material-symbols-outlined text-[16px]!" aria-hidden="true"
                        >add_task</span
                      >
                      {{
                        addedEntries.includes(entry.id)
                          ? 'Adicionadas ao board'
                          : `Adicionar ${selectedCount(entry)} ao board`
                      }}
                    </button>
                    <button
                      type="button"
                      class="h-[34px] cursor-pointer rounded-[9px] border border-(--border-default) px-[12px] text-[13px] font-medium transition-colors hover:bg-(--bg-subtle) dark:border-(--border-inverse) dark:hover:bg-white/10"
                    >
                      Editar antes
                    </button>
                  </div>
                </div>

                <div v-if="entry.actions" class="flex flex-wrap gap-[8px]">
                  <button
                    type="button"
                    class="flex h-[32px] cursor-pointer items-center gap-[6px] rounded-[9px] border border-(--border-default) px-[10px] text-[12.5px] font-medium transition-colors hover:bg-(--bg-subtle) dark:border-(--border-inverse) dark:hover:bg-white/10"
                  >
                    <span class="material-symbols-outlined text-[16px]!" aria-hidden="true"
                      >view_kanban</span
                    >
                    Ver no board
                  </button>
                  <button
                    type="button"
                    class="h-[32px] cursor-pointer rounded-[9px] border border-(--border-default) px-[10px] text-[12.5px] font-medium transition-colors hover:bg-(--bg-subtle) dark:border-(--border-inverse) dark:hover:bg-white/10"
                  >
                    Desfazer
                  </button>
                </div>
              </div>
            </article>
          </template>
        </div>

        <template #footer>
          <div class="mb-[10px] flex flex-wrap items-center gap-[8px]">
            <button
              v-for="prompt in ASSISTANT_PROMPTS"
              :key="prompt"
              type="button"
              class="h-[30px] cursor-pointer rounded-full border border-(--border-default) bg-(--surface) px-[12px] text-[12.5px] transition-colors hover:border-(--chat-ai) hover:text-(--chat-ai) dark:border-(--border-inverse) dark:bg-transparent"
              @click="draft = prompt"
            >
              {{ prompt }}
            </button>
            <span class="ml-auto text-[11.5px] text-(--text-muted)">Usa 4 créditos</span>
          </div>

          <ChatComposer
            v-model="draft"
            accent="ai"
            placeholder="Ex.: crie as tarefas para o evento de 14/11, com o Rafael cuidando de fornecedores…"
            submit-label="Gerar tarefas"
            submit-icon="auto_awesome"
            @submit="send"
          >
            <template #tools>
              <ChatToolButton icon="attach_file" label="Anexar arquivo" />
              <ChatToolButton icon="folder" label="Escolher do Drive" />
              <ChatToolButton icon="mic" label="Ditar" />
              <span
                class="ml-[4px] rounded-[6px] bg-(--bg-subtle) px-[7px] py-[2px] font-mono text-[11px] text-(--text-secondary) dark:bg-black/30 dark:text-(--text-inverse-muted)"
                >Setor: Marketing</span
              >
            </template>
          </ChatComposer>
        </template>
      </ChatPanelLayout>
    </div>
  </div>
</template>
