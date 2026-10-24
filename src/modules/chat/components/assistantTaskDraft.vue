<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BaseButton } from '@/shared/components'
import { fetchTaskOptions, matchPeople } from '@/modules/ai'
import type { AiDraftState, AiPerson, AiTaskConfirm, AiTaskDraft } from '@/modules/ai'

const props = defineProps<{ draft: AiTaskDraft; state?: AiDraftState; disabled?: boolean }>()
const emit = defineEmits<{ confirm: [payload: AiTaskConfirm]; discard: [] }>()

const PRIORITIES = [
  ['low', 'Baixa'],
  ['medium', 'Média'],
  ['high', 'Alta'],
  ['urgent', 'Urgente'],
] as const
const REASONS: Record<string, string> = {
  ambiguous: 'Há mais de uma pessoa com esse nome. Escolha:',
  no_access: 'não tem acesso a este setor.',
  not_found: 'não foi encontrado(a) neste setor.',
  sector_needed: 'Escolha o setor para atribuir',
}

const form = ref({
  title: props.draft.title,
  description: props.draft.description,
  priority: props.draft.priority,
  due_date: props.draft.due_date ?? '',
  due_time: props.draft.due_time ?? '',
  sector_id: props.draft.sector?.id ?? '',
})
const people = ref<AiPerson[]>(props.draft.people_options)
const assigneeIds = ref<string[]>(props.draft.assignees.map((p) => p.id))
const pending = ref(props.draft.unresolved)
const loadingPeople = ref(false)
const peopleError = ref('')
const showDescription = ref(!!props.draft.description)

const locked = computed(() => props.state?.status === 'creating' || props.disabled)
const selected = computed(() =>
  assigneeIds.value
    .map((id) => people.value.find((p) => p.id === id))
    .filter((p): p is AiPerson => !!p),
)
const addable = computed(() => people.value.filter((p) => !assigneeIds.value.includes(p.id)))
const canCreate = computed(
  () => !!form.value.title.trim() && !!form.value.sector_id && !locked.value,
)

function add(id: string) {
  if (id && !assigneeIds.value.includes(id)) assigneeIds.value.push(id)
}

function choose(query: string, id: string) {
  add(id)
  pending.value = pending.value.filter((item) => item.query !== query)
}

// Changing the sector reloads who can be assigned and re-matches the typed names.
watch(
  () => form.value.sector_id,
  async (sectorId, previous) => {
    if (!sectorId || sectorId === previous) return
    loadingPeople.value = true
    peopleError.value = ''
    try {
      people.value = await fetchTaskOptions(sectorId)
    } catch (e) {
      people.value = []
      peopleError.value = e instanceof Error ? e.message : 'Não foi possível carregar as pessoas.'
    } finally {
      loadingPeople.value = false
    }
    const queries = [
      ...pending.value.map((item) => item.query),
      ...props.draft.assignees.map((p) => p.name),
    ]
    assigneeIds.value = assigneeIds.value.filter((id) => people.value.some((p) => p.id === id))
    const still: typeof pending.value = []
    for (const query of queries.filter((q) => !selected.value.some((p) => p.name === q))) {
      const matches = matchPeople(query, people.value)
      if (matches.length === 1 && matches[0]) add(matches[0].id)
      else
        still.push({
          query,
          reason: matches.length ? 'ambiguous' : 'not_found',
          candidates: matches,
        })
    }
    pending.value = still
  },
)

function confirm() {
  if (!canCreate.value) return
  emit('confirm', {
    request_id: props.draft.request_id,
    sector_id: form.value.sector_id,
    title: form.value.title.trim(),
    description: form.value.description,
    priority: form.value.priority,
    due_date: form.value.due_date || null,
    due_time: form.value.due_time || null,
    assignee_ids: assigneeIds.value,
  })
}

const field =
  'w-full rounded-[8px] border border-(--border-default) bg-transparent px-[10px] py-[6px] text-[13px] outline-none focus:border-(--chat-ai) disabled:opacity-60 dark:border-(--border-inverse)'
const label = 'text-[11.5px] font-medium text-(--text-muted)'
</script>

<template>
  <div
    class="flex min-w-0 max-w-[640px] flex-col gap-[12px] rounded-[12px] border border-(--chat-ai) bg-(--surface) px-[14px] py-[14px] dark:bg-black/20"
  >
    <p v-if="state?.status === 'created'" class="text-[13px] font-medium text-(--chat-ai)">
      ✓ Tarefa criada a partir deste rascunho.
    </p>
    <p v-else-if="state?.status === 'discarded'" class="text-[13px] text-(--text-muted)">
      Rascunho descartado.
    </p>

    <template v-else>
      <p class="flex items-center gap-[6px] text-[12px] font-medium text-(--chat-ai)">
        <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">edit_note</span>
        Rascunho da tarefa · nada foi salvo ainda
      </p>

      <label class="flex flex-col gap-[4px]">
        <span :class="label">Título</span>
        <input v-model="form.title" :disabled="locked" maxlength="255" :class="field" />
      </label>

      <div class="grid gap-[10px] sm:grid-cols-2">
        <label class="flex flex-col gap-[4px]">
          <span :class="label">Setor</span>
          <select v-model="form.sector_id" :disabled="locked" :class="field">
            <option value="" disabled>Escolha o setor…</option>
            <option v-for="sector in draft.sector_options" :key="sector.id" :value="sector.id">
              {{ sector.organization_name }} · {{ sector.name }}
            </option>
          </select>
        </label>
        <div class="flex flex-col gap-[4px]">
          <span :class="label">Prioridade</span>
          <div class="flex gap-[4px]" role="radiogroup" aria-label="Prioridade">
            <button
              v-for="[value, text] in PRIORITIES"
              :key="value"
              type="button"
              role="radio"
              :aria-checked="form.priority === value"
              :disabled="locked"
              :class="[
                'h-[32px] flex-1 cursor-pointer rounded-[8px] border text-[12px] transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                form.priority === value
                  ? 'border-(--chat-ai) bg-(--chat-ai) text-white'
                  : 'border-(--border-default) hover:border-(--chat-ai) dark:border-(--border-inverse)',
              ]"
              @click="form.priority = value"
            >
              {{ text }}
            </button>
          </div>
        </div>
      </div>

      <div class="grid gap-[10px] sm:grid-cols-2">
        <label class="flex flex-col gap-[4px]">
          <span :class="label">Prazo (data)</span>
          <input v-model="form.due_date" type="date" :disabled="locked" :class="field" />
        </label>
        <label class="flex flex-col gap-[4px]">
          <span :class="label">Horário</span>
          <input v-model="form.due_time" type="time" :disabled="locked" :class="field" />
        </label>
      </div>
      <p v-if="form.due_time" class="-mt-[4px] text-[11.5px] text-(--text-muted)">
        O quadro guarda só a data do prazo; o horário vai na descrição da tarefa.
      </p>

      <div class="flex flex-col gap-[6px]">
        <span :class="label">Responsáveis</span>
        <div class="flex flex-wrap items-center gap-[6px]">
          <span
            v-for="(person, index) in selected"
            :key="person.id"
            class="flex items-center gap-[6px] rounded-full bg-(--chat-ai)/10 px-[10px] py-[4px] text-[12.5px]"
          >
            {{ person.name }}
            <span class="text-[10.5px] text-(--text-muted)">{{
              index === 0 ? 'responsável' : 'envolvido(a)'
            }}</span>
            <button
              type="button"
              :disabled="locked"
              :aria-label="`Remover ${person.name}`"
              class="cursor-pointer text-(--text-muted) hover:text-(--destructive)"
              @click="assigneeIds = assigneeIds.filter((id) => id !== person.id)"
            >
              ×
            </button>
          </span>
          <select
            v-if="addable.length"
            :disabled="locked || loadingPeople"
            :class="[field, 'w-auto']"
            aria-label="Adicionar pessoa"
            @change="
              (e) => {
                add((e.target as HTMLSelectElement).value)
                ;(e.target as HTMLSelectElement).value = ''
              }
            "
          >
            <option value="">{{ loadingPeople ? 'Carregando…' : '+ Adicionar pessoa' }}</option>
            <option v-for="person in addable" :key="person.id" :value="person.id">
              {{ person.name }}
            </option>
          </select>
          <span v-if="!selected.length && !addable.length && !loadingPeople" class="text-[12px] text-(--text-muted)">
            {{ form.sector_id ? 'Ninguém disponível neste setor.' : 'Escolha o setor primeiro.' }}
          </span>
        </div>
        <p v-if="selected.length > 1" class="text-[11.5px] text-(--text-muted)">
          A tarefa tem um único responsável ({{ selected[0]?.name }}); os demais ficam
          registrados na descrição.
        </p>
        <p v-if="peopleError" role="alert" class="text-[12px] text-(--destructive)">
          {{ peopleError }}
        </p>
        <div
          v-for="item in pending"
          :key="item.query"
          class="flex flex-wrap items-center gap-[8px] rounded-[8px] bg-black/5 px-[10px] py-[6px] text-[12px] dark:bg-white/5"
        >
          <template v-if="item.reason === 'ambiguous' && item.candidates.length">
            <span>"{{ item.query }}": {{ REASONS.ambiguous }}</span>
            <button
              v-for="person in item.candidates"
              :key="person.id"
              type="button"
              :disabled="locked"
              class="cursor-pointer rounded-full border border-(--chat-ai) px-[10px] py-[2px] text-(--chat-ai) hover:bg-(--chat-ai) hover:text-white"
              @click="choose(item.query, person.id)"
            >
              {{ person.name }}
            </button>
          </template>
          <span v-else-if="item.reason === 'sector_needed'">
            {{ REASONS.sector_needed }} "{{ item.query }}".
          </span>
          <span v-else>"{{ item.query }}" {{ REASONS[item.reason] ?? REASONS.not_found }}</span>
        </div>
      </div>

      <div class="flex flex-col gap-[4px]">
        <button
          v-if="!showDescription"
          type="button"
          class="w-fit cursor-pointer text-[12px] text-(--chat-ai)"
          :disabled="locked"
          @click="showDescription = true"
        >
          + Adicionar descrição
        </button>
        <label v-else class="flex flex-col gap-[4px]">
          <span :class="label">Descrição</span>
          <textarea
            v-model="form.description"
            rows="2"
            maxlength="5000"
            :disabled="locked"
            :class="[field, 'resize-y']"
          ></textarea>
        </label>
      </div>

      <p v-if="state?.status === 'failed'" role="alert" class="text-[12px] text-(--destructive)">
        {{ state.error }} Você pode tentar de novo: a tarefa não será duplicada.
      </p>

      <div class="flex flex-wrap items-center gap-[8px]">
        <BaseButton
          :label="state?.status === 'failed' ? 'Tentar de novo' : 'Criar tarefa'"
          size="sm"
          :full-width="false"
          :loading="state?.status === 'creating'"
          :disabled="!canCreate"
          class="mt-0!"
          @click="confirm"
        />
        <BaseButton
          variant="secondary"
          label="Descartar"
          size="sm"
          :full-width="false"
          :disabled="locked"
          class="mt-0!"
          @click="emit('discard')"
        />
      </div>
    </template>
  </div>
</template>
