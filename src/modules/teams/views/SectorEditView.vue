<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton, BaseInput, SubheaderComp, TopbarComp } from '@/shared/components'
import {
  MEMBERS,
  memberById,
  ROLES,
  SECTOR_COLORS,
  SECTOR_MEMBER_COUNT,
  SECTORS,
} from '../utils/mocks'
import { avatar, BADGE, BADGE_BASE, TOOLBAR_BUTTON } from '../utils/ui'

// Página só de interface: "Salvar setor" e "Arquivar" não chamam o backend.

const MIN_COLUMNS = 3

const props = defineProps<{ id: string }>()
const router = useRouter()

const sector = SECTORS.find((item) => item.id === props.id)
const form = ref({
  name: sector?.name ?? '',
  managerId: sector?.managerId ?? '',
  color: sector?.color ?? SECTOR_COLORS[0]!,
  description: sector?.description ?? '',
  columns: [...(sector?.columns ?? [])],
  wipLimit: String(sector?.wipLimit ?? 5),
  visibility: sector?.visibility ?? 'sector',
})
const newColumn = ref('')
const dragIndex = ref<number | null>(null)

const managers = MEMBERS.filter((member) => member.role !== 'guest')
const VISIBILITY = [
  { value: 'sector', label: 'Somente membros do setor' },
  { value: 'org', label: 'Toda a organização' },
]
const sectorMembers = computed(() =>
  (sector?.members ?? []).map(memberById).filter((member) => !!member),
)

function moveColumn(from: number, to: number) {
  if (to < 0 || to >= form.value.columns.length) return
  const [column] = form.value.columns.splice(from, 1)
  form.value.columns.splice(to, 0, column!)
}

function dropColumn(to: number) {
  if (dragIndex.value !== null) moveColumn(dragIndex.value, to)
  dragIndex.value = null
}

function addColumn() {
  const name = newColumn.value.trim()
  if (name && !form.value.columns.includes(name))
    form.value.columns.splice(form.value.columns.length - 1, 0, name)
  newColumn.value = ''
}

function save() {
  if (!form.value.name.trim()) {
    toast.error('Dê um nome para o setor.')
    return
  }
  if (!(Number(form.value.wipLimit) > 0)) {
    toast.error('O limite em andamento precisa ser maior que zero.')
    return
  }
  toast.success('Setor salvo (demonstração, sem backend).')
  router.push({ name: 'Team' })
}

function archive() {
  if (window.confirm(`Arquivar o setor ${form.value.name}?`)) {
    toast.success('Setor arquivado (demonstração).')
    router.push({ name: 'Team' })
  }
}
</script>

<template>
  <div
    class="flex min-h-[calc(100dvh-3.5rem)] w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp
      :crumbs="['Norte Studio', 'Setores', sector?.name ?? 'Setor', 'Editar']"
      has-notifications
    />

    <section class="flex flex-1 flex-col gap-[16px] px-[16px] pt-[24px] pb-[32px] sm:px-[28px]">
      <SubheaderComp
        title="Editar setor"
        :description="
          sector
            ? `${sector.name} · ${SECTOR_MEMBER_COUNT[sector.id]} membros · ${sector.openTasks} tarefas abertas`
            : 'Setor não encontrado'
        "
        class="mb-0!"
      >
        <div class="flex flex-wrap gap-[8px]">
          <BaseButton
            variant="ghost"
            label="Cancelar"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="router.push({ name: 'Team' })"
          />
          <BaseButton
            label="Salvar setor"
            :full-width="false"
            :disabled="!sector"
            :class="TOOLBAR_BUTTON"
            @click="save"
          />
        </div>
      </SubheaderComp>

      <p
        v-if="!sector"
        class="text-[13px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
      >
        Esse setor não existe ou foi arquivado. Volte para Equipe e setores.
      </p>

      <template v-else>
        <div class="grid items-start gap-[16px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <section
            class="flex flex-col gap-[14px] rounded-[16px] border border-(--border-default) bg-(--surface) p-[18px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
          >
            <h2 class="text-[15px]! leading-normal! font-semibold! tracking-normal!">
              Configurações do setor
            </h2>

            <div class="flex flex-col gap-[14px] sm:flex-row">
              <label
                class="flex min-w-0 flex-1 flex-col gap-[6px] text-[13px] leading-normal font-medium"
              >
                Nome
                <BaseInput
                  v-model="form.name"
                  placeholder="Nome do setor"
                  class="mt-0! font-normal"
                />
              </label>
              <label
                class="flex min-w-0 flex-1 flex-col gap-[6px] text-[13px] leading-normal font-medium"
              >
                Gestor
                <select
                  v-model="form.managerId"
                  class="h-[44px] w-full rounded-[10px] border border-(--border-default) bg-(--surface) px-[12px] text-[14px] outline-none focus:border-(--border-strong) dark:border-(--border-inverse) dark:bg-black/30 dark:focus:border-(--text-inverse-muted) font-normal"
                >
                  <option v-for="member in managers" :key="member.id" :value="member.id">
                    {{ member.name }}
                  </option>
                </select>
              </label>
            </div>

            <fieldset class="flex flex-col gap-[8px]">
              <legend class="mb-[8px] text-[13px] leading-normal font-medium">Cor</legend>
              <div class="flex flex-wrap gap-[8px]">
                <label
                  v-for="color in SECTOR_COLORS"
                  :key="color"
                  :class="[
                    'grid size-[28px] cursor-pointer place-items-center rounded-full ring-offset-2 ring-offset-(--surface) has-focus-visible:outline-2 has-focus-visible:outline-offset-4 dark:ring-offset-(--surface-inverse)',
                    form.color === color
                      ? 'ring-2 ring-(--text-primary) dark:ring-(--text-inverse)'
                      : '',
                  ]"
                  :style="{ backgroundColor: color }"
                >
                  <input
                    v-model="form.color"
                    type="radio"
                    name="sector-color"
                    :value="color"
                    class="sr-only"
                    :aria-label="`Cor ${color}`"
                  />
                </label>
              </div>
            </fieldset>

            <label class="flex flex-col gap-[6px] text-[13px] leading-normal font-medium">
              Descrição
              <textarea
                v-model="form.description"
                maxlength="280"
                class="min-h-[96px] resize-y rounded-[10px] border border-(--border-default) bg-(--surface) px-[12px] py-[11px] text-[14px] font-normal outline-none focus:border-(--border-strong) dark:border-(--border-inverse) dark:bg-black/30 dark:focus:border-(--text-inverse-muted)"
              ></textarea>
            </label>

            <div class="flex flex-col gap-[6px]">
              <span id="board-columns-label" class="text-[13px] leading-normal font-medium"
                >Colunas do board</span
              >
              <div
                class="flex min-h-[44px] flex-wrap items-center gap-[6px] rounded-[10px] border border-(--border-default) px-[8px] py-[6px] dark:border-(--border-inverse)"
                role="list"
                aria-labelledby="board-columns-label"
              >
                <span
                  v-for="(column, index) in form.columns"
                  :key="column"
                  role="listitem"
                  draggable="true"
                  :class="[
                    'flex cursor-grab items-center gap-[2px] rounded-[6px] bg-(--bg-muted) py-[2px] pr-[4px] pl-[8px] text-[12px] leading-[18px] text-(--text-secondary) dark:bg-white/10 dark:text-(--text-inverse-muted)',
                    dragIndex === index ? 'opacity-50' : '',
                  ]"
                  @dragstart="dragIndex = index"
                  @dragover.prevent
                  @drop="dropColumn(index)"
                  @dragend="dragIndex = null"
                >
                  {{ column }}
                  <button
                    type="button"
                    class="grid size-[16px] cursor-pointer place-items-center rounded-[4px] opacity-60 hover:opacity-100 disabled:hidden"
                    :disabled="index === 0"
                    :aria-label="`Mover ${column} para a esquerda`"
                    @click="moveColumn(index, index - 1)"
                  >
                    <span class="material-symbols-outlined text-[13px]!" aria-hidden="true"
                      >chevron_left</span
                    >
                  </button>
                  <button
                    type="button"
                    class="grid size-[16px] cursor-pointer place-items-center rounded-[4px] opacity-60 hover:opacity-100 disabled:hidden"
                    :disabled="form.columns.length <= MIN_COLUMNS"
                    :aria-label="`Remover coluna ${column}`"
                    @click="form.columns.splice(index, 1)"
                  >
                    <span class="material-symbols-outlined text-[13px]!" aria-hidden="true"
                      >close</span
                    >
                  </button>
                </span>
                <input
                  v-model="newColumn"
                  type="text"
                  placeholder="+ coluna"
                  aria-label="Nova coluna do board"
                  maxlength="30"
                  class="h-[24px] w-[90px] bg-transparent text-[12px] outline-none placeholder:text-(--text-muted)"
                  @keydown.enter.prevent="addColumn"
                />
              </div>
              <p class="text-[12px] leading-normal text-(--text-muted)">
                Arraste para reordenar. Mínimo de {{ MIN_COLUMNS }} colunas.
              </p>
            </div>

            <div class="flex flex-col gap-[14px] sm:flex-row">
              <label
                class="flex min-w-0 flex-1 flex-col gap-[6px] text-[13px] leading-normal font-medium"
              >
                Limite em andamento
                <BaseInput
                  v-model="form.wipLimit"
                  type="number"
                  inputmode="numeric"
                  class="mt-0! font-normal"
                />
              </label>
              <label
                class="flex min-w-0 flex-1 flex-col gap-[6px] text-[13px] leading-normal font-medium"
              >
                Visibilidade
                <select
                  v-model="form.visibility"
                  class="h-[44px] w-full rounded-[10px] border border-(--border-default) bg-(--surface) px-[12px] text-[14px] outline-none focus:border-(--border-strong) dark:border-(--border-inverse) dark:bg-black/30 dark:focus:border-(--text-inverse-muted) font-normal"
                >
                  <option v-for="option in VISIBILITY" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </label>
            </div>
          </section>

          <section
            class="flex flex-col rounded-[16px] border border-(--border-default) bg-(--surface) px-[18px] pt-[16px] pb-[6px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
          >
            <header class="flex items-center justify-between pb-[4px]">
              <h2 class="text-[15px]! leading-normal! font-semibold! tracking-normal!">
                Membros · {{ SECTOR_MEMBER_COUNT[sector.id] }}
              </h2>
              <button
                type="button"
                class="cursor-pointer text-[13px] font-medium text-(--bg-orange) hover:underline"
                @click="toast.success('Adicionar membros ainda não está integrado.')"
              >
                Adicionar
              </button>
            </header>
            <ul class="flex flex-col">
              <li
                v-for="member in sectorMembers"
                :key="member.id"
                class="flex items-center gap-[12px] border-b border-(--border-default) py-[11px] last:border-b-0 dark:border-(--border-inverse)"
              >
                <span
                  :class="[
                    'grid size-[32px] shrink-0 place-items-center rounded-full text-[11px] leading-none font-semibold text-white',
                    avatar(member.name).color
                      ? ''
                      : 'bg-(--text-primary) dark:bg-(--text-inverse) dark:text-(--text-primary)',
                  ]"
                  :style="{ backgroundColor: avatar(member.name).color || undefined }"
                  aria-hidden="true"
                  >{{ avatar(member.name).initials }}</span
                >
                <span class="flex min-w-0 flex-1 flex-col leading-normal">
                  <span class="text-[13.5px] font-medium">{{ member.name }}</span>
                  <span class="text-[12px] text-(--text-muted)">
                    {{
                      member.id === form.managerId ? 'Gestor do setor' : ROLES[member.role].detail
                    }}
                  </span>
                </span>
                <span
                  :class="[
                    BADGE_BASE,
                    member.id === form.managerId
                      ? BADGE.accent
                      : ROLES[member.role].tone === 'outline'
                        ? BADGE.neutral
                        : BADGE[ROLES[member.role].tone],
                  ]"
                  >{{ member.id === form.managerId ? 'Gestor' : ROLES[member.role].label }}</span
                >
              </li>
            </ul>
          </section>
        </div>

        <section
          class="flex flex-col gap-[12px] rounded-[16px] border border-[#f5d0d0] bg-[#fdf0f0] px-[16px] py-[14px] sm:flex-row sm:items-center dark:border-[#dc2626]/30 dark:bg-[#dc2626]/10"
        >
          <span
            class="material-symbols-outlined text-[20px]! text-(--destructive)"
            aria-hidden="true"
            >error</span
          >
          <div class="flex min-w-0 flex-1 flex-col gap-[2px] leading-normal">
            <h2
              class="text-[14px]! leading-normal! font-semibold! tracking-normal! text-(--destructive)"
            >
              Zona de perigo
            </h2>
            <p class="text-[13px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
              Arquivar o setor esconde o board e o canal de chat. As tarefas ficam disponíveis para
              consulta por 90 dias.
            </p>
          </div>
          <BaseButton
            variant="secondary"
            label="Arquivar setor"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="archive"
          />
        </section>
      </template>
    </section>
  </div>
</template>
