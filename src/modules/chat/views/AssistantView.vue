<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton, TopbarComp } from '@/shared/components'
import { useAuthStore } from '@/modules/auth'
import { useOrganizationsStore } from '@/modules/organizations'
import {
  aiActionDeleted,
  aiActionDraft,
  aiActionLabel,
  aiActionNotes,
  aiActionTasks,
  aiActionTone,
  aiErrorDetails,
  aiVisibleActions,
  useAiStore,
} from '@/modules/ai'
import type { AiTask } from '@/modules/ai'
import {
  AiBrandName,
  AssistantTaskCard,
  AssistantTaskDraft,
  ChatAvatar,
  ChatComposer,
  ChatPanelLayout,
  ChatSectionTitle,
  ChatToolButton,
} from '../components'
import { formatSize, formatTime } from '../utils'

const auth = useAuthStore()
const ai = useAiStore()
const organizations = useOrganizationsStore()
const route = useRoute()
const router = useRouter()
const search = ref('')
const draft = ref('')
const files = ref<File[]>([])
const scroller = useTemplateRef<HTMLElement>('scroller')
const fileInput = useTemplateRef<HTMLInputElement>('file-input')
const historyTitle = computed(() => ai.active?.title ?? 'Nova conversa')
const visibleHistory = computed(() =>
  ai.conversations.filter((item) =>
    item.title.toLocaleLowerCase('pt-BR').includes(search.value.trim().toLocaleLowerCase('pt-BR')),
  ),
)
const composerDisabled = computed(() => ai.isBusy || !!ai.active?.pending || !!ai.active?.expired)

const PROMPTS = [
  'Mostre minhas tarefas pendentes.',
  'Crie uma tarefa de prioridade alta para amanhã.',
  'Quais tarefas tenho para amanhã?',
  'Quais setores posso usar?',
]

function taskDelete(task: AiTask) {
  // Deletion is the one task action that still goes through the assistant,
  // so the server can issue its single-use confirmation token.
  void ai.ask(`Exclua a tarefa "${task.title}" (id ${task.id}).`, organizations.current?.id)
}

watch(
  () => auth.user?.id ?? null,
  (id) => {
    ai.setOwner(id)
    draft.value = ''
    clearFiles()
  },
  { immediate: true, flush: 'sync' },
)

onMounted(async () => {
  try {
    const user = await auth.loadUser()
    if (!user) {
      await router.replace({ name: 'Login', query: { redirect: route.fullPath } })
    } else if (!user.is_subscriber) {
      await router.replace({ name: 'Plans' })
    } else if (!organizations.organizations.length) {
      // Only context for the assistant; it still works (and asks) without it.
      await organizations.load().catch(() => undefined)
    }
  } catch {
    toast.error('Não foi possível verificar seu acesso à IA. Tente novamente.')
    await router.replace({ name: 'Login', query: { redirect: route.fullPath } })
  }
})

watch(
  () => ai.error,
  (message) => {
    if (message) toast.error(message)
  },
)

async function scrollToEnd() {
  await nextTick()
  scroller.value?.parentElement?.scrollTo({
    top: scroller.value.parentElement.scrollHeight,
    behavior: 'smooth',
  })
}
watch(() => [ai.activeId, ai.messages.length, ai.isBusy], scrollToEnd, { immediate: true })

function clearFiles() {
  files.value = []
  if (fileInput.value) fileInput.value.value = ''
}

function selectFiles() {
  files.value = Array.from(fileInput.value?.files ?? [])
}

function newConversation() {
  ai.newConversation()
  draft.value = ''
  clearFiles()
}

function openHistory(id: string) {
  ai.select(id)
  draft.value = ''
  clearFiles()
}

function selectHistoryFromPicker(event: Event) {
  const id = (event.currentTarget as HTMLSelectElement).value
  if (id) openHistory(id)
}

async function send() {
  if (await ai.ask(draft.value, organizations.current?.id)) draft.value = ''
}

async function retry() {
  if (await ai.retry()) draft.value = ''
}

async function analyze() {
  if (await ai.analyze([...files.value])) clearFiles()
}
</script>

<template>
  <div
    class="flex h-[calc(100dvh-3.75rem)] md:h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp v-model:search="search" :crumbs="['Inceptum AI', historyTitle]" />

    <div
      class="flex min-h-0 flex-1 flex-col px-[20px] py-[12px] sm:px-[32px] sm:py-[20px] lg:px-[40px] lg:py-[28px]"
    >
      <ChatPanelLayout tinted>
        <template #aside>
          <div class="flex items-center gap-[10px] px-[18px] pt-[18px]">
            <ChatAvatar name="Inceptum AI" variant="ai" :size="30" />
            <h2 class="text-[17px]! leading-normal! font-semibold! tracking-normal!">
              <AiBrandName />
            </h2>
          </div>
          <p
            class="px-[18px] pt-[12px] text-[12.5px] leading-[19px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
          >
            Consulte, crie e organize suas tarefas por mensagem. A Inceptum AI usa os setores aos
            quais você tem acesso.
          </p>
          <div
            class="mx-[16px] mt-[16px] rounded-[12px] border border-(--border-default) bg-(--surface) p-[12px] text-[12px] leading-[19px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
          >
            <p>
              As alterações confirmadas pelo assistente já são salvas nas tarefas. Exclusões
              precisam da sua confirmação.
            </p>
            <p class="mt-[8px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
              Imagens e PDFs podem ser analisados separadamente para gerar um relatório.
            </p>
          </div>

          <ChatSectionTitle>Conversas desta sessão</ChatSectionTitle>
          <nav aria-label="Histórico de conversas" class="flex flex-col gap-[2px] pb-[12px]">
            <button
              v-for="item in visibleHistory"
              :key="item.id"
              type="button"
              :disabled="ai.isBusy"
              :aria-current="item.id === ai.activeId ? 'true' : undefined"
              :class="[
                'mx-[8px] cursor-pointer truncate rounded-[9px] px-[10px] py-[8px] text-left text-[13px] leading-normal transition-colors disabled:cursor-wait disabled:opacity-50',
                item.id === ai.activeId
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
          <ChatAvatar name="Inceptum AI" variant="ai" :size="32" />
          <div class="flex min-w-0 flex-1 flex-col leading-normal">
            <h1 class="text-[16px]! leading-normal! font-semibold! tracking-normal!">
              <AiBrandName />
            </h1>
            <p class="truncate text-[12px] text-(--text-muted)">Tarefas e setores da sua conta</p>
          </div>
          <BaseButton
            variant="secondary"
            label="Nova conversa"
            icon="add"
            icon-position="left"
            size="sm"
            :full-width="false"
            :disabled="ai.isBusy"
            class="mt-0! h-[34px]! gap-[6px]! rounded-[10px]! px-[12px]! py-0! text-[13px]! [&_.material-symbols-outlined]:text-[17px]!"
            @click="newConversation"
          />
          <select
            :value="ai.activeId ?? ''"
            aria-label="Selecionar conversa do assistente"
            :disabled="ai.isBusy || !ai.conversations.length"
            class="h-[36px] w-full basis-full min-w-0 rounded-[9px] border border-(--border-default) bg-(--surface) px-[10px] text-[13px] text-(--text-primary) outline-none focus:border-(--bg-orange) disabled:opacity-60 md:hidden dark:border-(--border-inverse) dark:bg-(--surface-inverse) dark:text-(--text-inverse)"
            @change="selectHistoryFromPicker"
          >
            <option value="" disabled>Selecionar conversa</option>
            <option v-for="item in ai.conversations" :key="item.id" :value="item.id">
              {{ item.title }}
            </option>
          </select>
        </template>

        <div
          ref="scroller"
          class="flex flex-col gap-[18px]"
          aria-live="polite"
          :aria-busy="ai.isBusy"
        >
          <div
            v-if="!ai.messages.length"
            class="flex flex-col items-center gap-[10px] py-[60px] text-center"
          >
            <ChatAvatar name="Inceptum AI" variant="ai" :size="44" />
            <p class="leading-normal"><AiBrandName class="text-[24px]" /></p>
            <p class="text-[15px] font-semibold">Como posso ajudar?</p>
            <p class="max-w-[420px] text-[13px] leading-[20px] text-(--text-muted)">
              Peça para criar uma tarefa, consultar seus prazos ou atualizar uma prioridade. Informe
              o setor quando necessário.
            </p>
          </div>

          <template v-for="entry in ai.messages" :key="entry.id">
            <article v-if="entry.role === 'user'" class="flex justify-end gap-[10px]">
              <div class="flex max-w-[min(560px,85%)] flex-col items-end gap-[6px]">
                <p class="text-[11.5px] leading-normal text-(--text-muted)">
                  Você · {{ formatTime(entry.created_at) }}
                </p>
                <p
                  class="whitespace-pre-wrap rounded-[12px] rounded-tr-[4px] bg-(--text-primary) px-[12px] py-[8px] text-[13.5px] leading-[20px] text-white dark:bg-(--surface-inverse) dark:text-(--text-inverse)"
                >
                  {{ entry.content }}
                </p>
                <p
                  v-for="file in entry.files"
                  :key="file.name"
                  class="max-w-full break-all text-[12px] text-(--text-muted)"
                >
                  {{ file.name }} · {{ formatSize(file.size) }}
                </p>
                <p v-if="entry.error" role="alert" class="text-[12px] text-(--destructive)">
                  {{ entry.error }}
                </p>
              </div>
              <ChatAvatar :name="auth.user?.name ?? 'Você'" variant="self" :size="36" />
            </article>

            <article v-else class="flex gap-[10px]">
              <ChatAvatar name="Inceptum AI" variant="ai" :size="36" />
              <div class="flex min-w-0 flex-1 flex-col gap-[10px]">
                <p class="flex items-baseline gap-[8px] leading-normal">
                  <AiBrandName class="text-[13.5px]" />
                  <span class="text-[11.5px] text-(--text-muted)">{{
                    formatTime(entry.created_at)
                  }}</span>
                </p>
                <p
                  class="max-w-[640px] whitespace-pre-wrap break-words text-[13.5px] leading-[21px]"
                >
                  {{ entry.content }}
                </p>

                <div
                  v-for="(action, index) in aiVisibleActions(entry.actions)"
                  :key="`${action.action}-${index}`"
                  class="flex max-w-[640px] flex-col gap-[8px]"
                >
                  <AssistantTaskDraft
                    v-if="aiActionDraft(action)"
                    :draft="aiActionDraft(action)!"
                    :state="ai.drafts[`${entry.id}:${index}`]"
                    :disabled="ai.isBusy || !!ai.active?.expired"
                    @confirm="(payload) => ai.confirmDraft(`${entry.id}:${index}`, payload)"
                    @discard="ai.discardDraft(`${entry.id}:${index}`)"
                  />
                  <p
                    v-else-if="aiActionTone(action) === 'error'"
                    role="alert"
                    class="text-[12px] text-(--destructive)"
                  >
                    {{ aiActionLabel(action) }} não realizada:
                    {{
                      aiErrorDetails(action.error) ||
                      (action.status === 'uncertain'
                        ? 'resultado incerto, confira antes de tentar de novo.'
                        : 'tente novamente.')
                    }}
                  </p>
                  <p
                    v-else-if="aiActionTone(action) === 'pending'"
                    class="text-[12px] font-medium text-(--destructive)"
                  >
                    Exclusão pendente: nada foi apagado ainda. Confirme abaixo.
                  </p>
                  <template v-else>
                    <p class="text-[12px] font-medium text-(--chat-ai)">
                      {{ aiActionLabel(action) }}
                    </p>
                    <p v-if="aiActionDeleted(action)" class="text-[12px] text-(--text-muted)">
                      Removido com sucesso.
                    </p>
                    <AssistantTaskCard
                      v-for="task in aiActionTasks(action)"
                      :key="task.id"
                      :task="task"
                      :disabled="ai.isBusy || !!ai.active?.pending || !!ai.active?.expired"
                      @delete="taskDelete"
                    />
                    <p
                      v-for="note in aiActionNotes(action)"
                      :key="note"
                      class="text-[12px] leading-[18px] text-(--text-muted)"
                    >
                      ℹ {{ note }}
                    </p>
                  </template>
                </div>

                <div
                  v-if="entry.choices?.length && entry.id === ai.messages.at(-1)?.id"
                  class="flex flex-wrap gap-[6px]"
                >
                  <button
                    v-for="choice in entry.choices"
                    :key="choice"
                    type="button"
                    :disabled="composerDisabled"
                    class="h-[30px] cursor-pointer rounded-full border border-(--chat-ai) px-[12px] text-[12.5px] text-(--chat-ai) transition-colors hover:bg-(--chat-ai) hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    @click="ai.ask(choice, organizations.current?.id)"
                  >
                    {{ choice }}
                  </button>
                </div>

                <div
                  v-if="
                    entry.confirmation_token &&
                    entry.confirmation_token === ai.active?.confirmation_token
                  "
                  class="flex flex-wrap items-center gap-[8px]"
                >
                  <BaseButton
                    variant="destructive"
                    label="Confirmar exclusão"
                    size="sm"
                    :full-width="false"
                    :disabled="ai.isBusy || !!ai.active?.pending"
                    class="mt-0!"
                    @click="ai.confirmDeletion()"
                  />
                  <BaseButton
                    variant="secondary"
                    label="Cancelar exclusão"
                    size="sm"
                    :full-width="false"
                    :disabled="ai.isBusy || !!ai.active?.pending"
                    class="mt-0!"
                    @click="ai.ask('Cancele a exclusão pendente.')"
                  />
                </div>

                <a
                  v-if="entry.report"
                  :href="entry.report.url"
                  :download="entry.report.file_name"
                  class="flex w-fit items-center gap-[6px] rounded-[9px] bg-(--bg-orange) px-[12px] py-[8px] text-[13px] font-medium text-white transition-colors hover:bg-[#e85d00] dark:text-white"
                >
                  <span class="material-symbols-outlined text-[17px]!" aria-hidden="true"
                    >download</span
                  >Baixar relatório PDF
                </a>
              </div>
            </article>
          </template>
          <p v-if="ai.isBusy" role="status" class="text-[13px] text-(--text-muted)">
            {{
              ai.isAnalyzing
                ? 'Analisando os arquivos e gerando o relatório…'
                : 'O assistente está processando sua mensagem…'
            }}
          </p>
          <div
            v-if="ai.active?.pending && !ai.isBusy"
            class="flex flex-wrap items-center gap-[10px]"
          >
            <p class="text-[12px] text-(--text-muted)">
              A resposta não foi recebida. Tente novamente para recuperar o resultado da mesma
              solicitação.
            </p>
            <BaseButton
              label="Tentar novamente"
              size="sm"
              :full-width="false"
              class="mt-0!"
              @click="retry"
            />
          </div>
          <p v-if="ai.active?.expired" role="alert" class="text-[13px] text-(--destructive)">
            O contexto desta conversa expirou. Use “Nova conversa” para continuar.
          </p>
        </div>

        <template #footer>
          <div class="mb-[10px] flex flex-wrap items-center gap-[8px]">
            <button
              v-for="prompt in PROMPTS"
              :key="prompt"
              type="button"
              :disabled="composerDisabled"
              class="h-[30px] cursor-pointer rounded-full border border-(--border-default) bg-(--surface) px-[12px] text-[12.5px] transition-colors hover:border-(--bg-orange) hover:bg-(--bg-orange)/5 hover:text-(--bg-orange) disabled:cursor-not-allowed disabled:opacity-50 dark:border-(--border-inverse) dark:bg-transparent dark:hover:bg-(--bg-orange)/10"
              @click="draft = prompt"
            >
              {{ prompt }}
            </button>
          </div>
          <div
            v-if="files.length"
            class="mb-[10px] flex flex-col gap-[6px] rounded-[10px] border border-(--border-default) p-[10px] dark:border-(--border-inverse)"
          >
            <p class="text-[12px] text-(--text-muted)">
              Os arquivos serão analisados separadamente para gerar um relatório PDF.
            </p>
            <div
              v-for="(file, index) in files"
              :key="`${file.name}-${index}`"
              class="flex items-center gap-[8px] text-[12px]"
            >
              <span class="min-w-0 flex-1 truncate"
                >{{ file.name }} · {{ formatSize(file.size) }}</span
              >
              <button
                type="button"
                :disabled="ai.isBusy"
                :aria-label="`Remover ${file.name}`"
                class="cursor-pointer text-(--text-muted)"
                @click="files.splice(index, 1)"
              >
                Remover
              </button>
            </div>
            <BaseButton
              label="Gerar relatório PDF"
              size="sm"
              :full-width="false"
              :loading="ai.isAnalyzing"
              :disabled="ai.isBusy"
              class="mt-0!"
              @click="analyze"
            />
          </div>
          <input
            ref="file-input"
            type="file"
            class="sr-only"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            :disabled="ai.isBusy"
            aria-label="Selecionar imagens ou PDFs para análise"
            @change="selectFiles"
          />
          <fieldset class="min-w-0" :disabled="composerDisabled">
            <ChatComposer
              v-model="draft"
              accent="ai"
              placeholder="Ex.: crie uma tarefa de prioridade alta para revisar o relatório sexta-feira…"
              submit-label="Enviar mensagem"
              submit-icon="send"
              @submit="send"
            >
              <template #tools>
                <ChatToolButton
                  icon="attach_file"
                  label="Analisar imagens ou PDFs"
                  @click="fileInput?.click()"
                />
              </template>
            </ChatComposer>
          </fieldset>
        </template>
      </ChatPanelLayout>
    </div>
  </div>
</template>
