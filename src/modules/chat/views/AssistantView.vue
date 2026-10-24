<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton } from '@/shared/components'
import { useAuthStore } from '@/modules/auth'
import { aiErrorDetails, useAiStore } from '@/modules/ai'
import {
  AssistantTaskCard,
  ChatAvatar,
  ChatComposer,
  ChatPanelLayout,
  ChatSectionTitle,
  ChatToolButton,
  ChatTopbar,
} from '../components'
import { formatSize, formatTime } from '../utils'

const auth = useAuthStore()
const ai = useAiStore()
const route = useRoute()
const router = useRouter()
const accessChecked = ref(false)
const hasAccess = computed(() => accessChecked.value && auth.user?.is_subscriber === true)
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
  'Quais setores posso usar?',
  'Mostre minhas tarefas pendentes.',
  'Quais tarefas tenho para amanhã?',
]
const ACTION_LABELS: Record<string, string> = {
  criar_task: 'Tarefa criada',
  editar_task: 'Tarefa atualizada',
  concluir_task: 'Tarefa concluída',
  listar_tasks: 'Tarefas encontradas',
  buscar_task: 'Resultado da busca',
  listar_contexto: 'Setores disponíveis',
  excluir_task: 'Exclusão de tarefa',
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
    } else {
      accessChecked.value = true
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

async function send() {
  if (await ai.ask(draft.value)) draft.value = ''
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
    v-if="hasAccess"
    class="flex h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <ChatTopbar
      v-model:search="search"
      :crumbs="['Assistente IA', historyTitle]"
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
            Consulte, crie e organize suas tarefas por mensagem. O assistente usa os setores aos
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
          <ChatAvatar name="Assistente" variant="ai" :size="32" />
          <div class="flex min-w-0 flex-1 flex-col leading-normal">
            <h1 class="text-[15px]! leading-normal! font-semibold! tracking-normal!">
              Assistente IA
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
            <ChatAvatar name="Assistente" variant="ai" :size="44" />
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
              <ChatAvatar name="Assistente" variant="ai" :size="36" />
              <div class="flex min-w-0 flex-1 flex-col gap-[10px]">
                <p class="flex items-baseline gap-[8px] leading-normal">
                  <span class="text-[13.5px] font-semibold">Assistente IA</span>
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
                  v-for="(action, index) in entry.actions"
                  :key="`${action.name}-${index}`"
                  class="flex max-w-[640px] flex-col gap-[8px]"
                >
                  <template v-if="action.ok || action.confirmation_required">
                    <p class="text-[12px] font-medium text-(--chat-ai)">
                      {{ ACTION_LABELS[action.name] ?? 'Resultado da solicitação' }}
                    </p>
                    <AssistantTaskCard v-if="action.task" :task="action.task" />
                    <AssistantTaskCard v-for="task in action.tasks" :key="task.id" :task="task" />
                    <p v-if="action.deleted_task_id" class="text-[12px] text-(--text-muted)">
                      Tarefa excluída: {{ action.deleted_task_id }}
                    </p>
                    <ul
                      v-if="action.sectors?.length"
                      class="space-y-[4px] text-[12px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
                    >
                      <li v-for="sector in action.sectors" :key="sector.id">
                        {{ sector.organization_name }} · {{ sector.name }}
                      </li>
                    </ul>
                    <p v-if="action.ambiguous" class="text-[12px] text-(--text-muted)">
                      Há mais de uma tarefa correspondente. Informe qual deseja alterar.
                    </p>
                    <p v-if="action.has_more" class="text-[12px] text-(--text-muted)">
                      Há mais resultados. Refine sua busca.
                    </p>
                  </template>
                  <p v-else role="alert" class="text-[12px] text-(--destructive)">
                    {{ aiErrorDetails(action.error) || 'Esta operação não foi realizada.' }}
                  </p>
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
                  class="flex w-fit items-center gap-[6px] rounded-[9px] bg-(--chat-ai) px-[12px] py-[8px] text-[13px] font-medium text-white hover:opacity-90 dark:text-white"
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
              class="h-[30px] cursor-pointer rounded-full border border-(--border-default) bg-(--surface) px-[12px] text-[12.5px] transition-colors hover:border-(--chat-ai) hover:text-(--chat-ai) disabled:cursor-not-allowed disabled:opacity-50 dark:border-(--border-inverse) dark:bg-transparent"
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
              placeholder="Ex.: crie uma tarefa para estudar Django amanhã no setor Estudos…"
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
