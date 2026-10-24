<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '@/app/plugins/axios'
import { BaseButton, SubheaderComp, TopbarComp } from '@/shared/components'
import { avatar } from '@/shared/utils/people'
import { categoryColors } from '@/shared/utils/chartColors'
import {
  getSector,
  useKanbanStore,
  useSectorAccessStore,
  useSectorsStore,
  type Sector,
  type SectorRole,
} from '@/modules/module'
import { useOrganizationsStore } from '@/modules/organizations'
import { BADGE, BADGE_BASE, TOOLBAR_BUTTON } from '../utils/ui'

const props = defineProps<{ id: string }>()
const router = useRouter()
const sectors = useSectorsStore()
const access = useSectorAccessStore()
const board = useKanbanStore()
const organizations = useOrganizationsStore()

const COLORS = categoryColors(6)
const ROLE_LABELS: Record<SectorRole, string> = {
  manager: 'Gestor',
  editor: 'Membro',
  viewer: 'Leitor',
}
const ROLE_TONES: Record<SectorRole, string> = {
  manager: BADGE.accent,
  editor: BADGE.outline,
  viewer: BADGE.neutral,
}

const sector = ref<(Sector & { my_role: SectorRole }) | null>(null)
const missing = ref(false)
const loading = ref(false)
const saving = ref(false)
const form = ref({ name: '', description: '', color: COLORS[0]!, isPrivate: true, wip: '' })
const newColumn = ref('')
const adding = ref(false)
const candidate = ref('')
const confirm = ref<HTMLDialogElement | null>(null)

const canEdit = computed(() => sector.value?.my_role === 'manager')
const inProgress = computed(() => board.statuses.find((s) => s.category === 'in_progress'))
const candidates = computed(() =>
  organizations.members.filter((m) => !access.members.some((a) => a.user_id === m.user_id)),
)
const description = computed(() => {
  const members = access.members.length
  return `${members} ${members === 1 ? 'membro' : 'membros'} · ${board.tasks.filter((t) => !t.completed_at).length} tarefas abertas`
})

async function load() {
  loading.value = true
  missing.value = false
  try {
    const loaded = await getSector(props.id)
    sector.value = loaded
    form.value = {
      name: loaded.name,
      description: loaded.description,
      color: loaded.color || COLORS[0]!,
      isPrivate: loaded.is_private,
      wip: '',
    }
    await Promise.all([
      access.load(props.id),
      board.load(props.id),
      organizations.members.length || organizations.loadMembers(loaded.organization_id),
    ])
    form.value.wip = inProgress.value?.wip_limit ? String(inProgress.value.wip_limit) : ''
  } catch {
    missing.value = true
    sector.value = null
  } finally {
    loading.value = false
  }
}
watch(() => props.id, load, { immediate: true })

const fail = (error: unknown, fallback: string) => toast.error(getErrorMessage(error, fallback))

async function save() {
  if (!canEdit.value || saving.value || !form.value.name.trim()) return
  saving.value = true
  try {
    await sectors.update(props.id, {
      name: form.value.name.trim(),
      description: form.value.description,
      color: form.value.color,
      is_private: form.value.isPrivate,
    })
    const wip = form.value.wip.trim() ? Number(form.value.wip) : null
    if (inProgress.value && wip !== inProgress.value.wip_limit) {
      await board.editStatus(inProgress.value.id, { wip_limit: wip })
    }
    toast.success('Setor salvo.')
    await router.push({ name: 'SectorBoard', params: { sectorId: props.id } })
  } catch (error) {
    fail(error, 'Não foi possível salvar o setor.')
  } finally {
    saving.value = false
  }
}

async function addColumn() {
  const name = newColumn.value.trim()
  if (!name || !canEdit.value) return
  try {
    await board.addStatus({ name, category: 'in_progress' })
    newColumn.value = ''
  } catch (error) {
    fail(error, 'Não foi possível adicionar a coluna.')
  }
}

async function removeColumn(id: string) {
  try {
    await board.removeStatus(id)
  } catch (error) {
    fail(error, 'Não foi possível remover a coluna. Mova as tarefas dela antes.')
  }
}

async function changeRole(memberId: number, role: SectorRole) {
  try {
    await access.changeMemberRole(memberId, role)
  } catch (error) {
    fail(error, 'Não foi possível mudar o papel.')
  }
}

async function removeMember(memberId: number) {
  try {
    await access.removeMember(memberId)
  } catch (error) {
    fail(error, 'Não foi possível remover a pessoa do setor.')
  }
}

async function addMember() {
  if (!candidate.value) return
  try {
    await access.addMember({ user_id: candidate.value })
    candidate.value = ''
    adding.value = false
  } catch (error) {
    fail(error, 'Não foi possível adicionar a pessoa.')
  }
}

async function archive() {
  confirm.value?.close()
  try {
    await sectors.remove(props.id)
    toast.success('Setor arquivado.')
    await router.push({ name: 'Team' })
  } catch (error) {
    fail(error, 'Não foi possível arquivar o setor.')
  }
}

const field =
  'rounded-[10px] border border-(--border-default) bg-transparent px-[12px] py-[10px] text-[14px] leading-normal outline-none focus:border-(--border-strong) disabled:opacity-60 dark:border-(--border-inverse)'
</script>

<template>
  <div
    class="flex min-h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp :crumbs="['Equipe e setores', sector?.name ?? 'Setor', 'Editar']" />

    <section class="flex flex-1 flex-col gap-[16px] px-[16px] pt-[24px] pb-[32px] sm:px-[28px]">
      <SubheaderComp
        title="Editar setor"
        :description="missing ? 'Setor não encontrado' : `${sector?.name ?? ''} · ${description}`"
        class="mb-0!"
      >
        <div class="flex flex-wrap items-center gap-[8px]">
          <BaseButton
            variant="ghost"
            label="Cancelar"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="router.push({ name: 'SectorBoard', params: { sectorId: props.id } })"
          />
          <BaseButton
            label="Salvar setor"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            :loading="saving"
            :disabled="!canEdit || !form.name.trim()"
            @click="save"
          />
        </div>
      </SubheaderComp>

      <p v-if="missing" class="text-[14px] text-(--text-secondary)">
        Esse setor não existe, foi arquivado ou você não tem acesso a ele.
        <RouterLink to="/equipe" class="underline">Voltar para Equipe e setores</RouterLink>
      </p>
      <p v-else-if="loading && !sector" role="status" class="text-[14px] text-(--text-muted)">
        Carregando setor…
      </p>

      <template v-else-if="sector">
        <p
          v-if="!canEdit"
          class="rounded-[12px] border border-(--border-default) bg-(--surface) px-[14px] py-[10px] text-[13px] text-(--text-secondary) dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
        >
          Só quem é gestor do setor pode alterar estas configurações.
        </p>

        <div class="grid items-start gap-[16px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <form
            class="grid gap-[16px] rounded-[16px] border border-(--border-default) bg-(--surface) p-[18px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
            @submit.prevent="save"
          >
            <h2 class="text-[15px]! leading-normal! font-semibold! tracking-normal!">
              Configurações do setor
            </h2>

            <label class="grid gap-[6px] text-[13px] font-medium">
              Nome
              <input
                v-model="form.name"
                maxlength="255"
                required
                :disabled="!canEdit"
                :class="[field, 'font-normal']"
              />
            </label>

            <div class="grid gap-[8px]">
              <span class="text-[13px] font-medium">Cor</span>
              <div class="flex gap-[10px]" role="radiogroup" aria-label="Cor do setor">
                <button
                  v-for="color in COLORS"
                  :key="color"
                  type="button"
                  role="radio"
                  :aria-checked="form.color === color"
                  :aria-label="`Cor ${color}`"
                  :disabled="!canEdit"
                  :class="[
                    'size-[26px] cursor-pointer rounded-full ring-offset-2 ring-offset-(--surface) disabled:opacity-60 dark:ring-offset-(--surface-inverse)',
                    form.color === color
                      ? 'ring-2 ring-(--text-primary) dark:ring-(--text-inverse)'
                      : '',
                  ]"
                  :style="{ backgroundColor: color }"
                  @click="form.color = color"
                />
              </div>
            </div>

            <label class="grid gap-[6px] text-[13px] font-medium">
              Descrição
              <textarea
                v-model="form.description"
                rows="4"
                :disabled="!canEdit"
                :class="[field, 'resize-y font-normal']"
              />
            </label>

            <div class="grid gap-[6px]">
              <span class="text-[13px] font-medium">Colunas</span>
              <ul
                class="flex flex-wrap gap-[6px] rounded-[10px] border border-(--border-default) p-[8px] dark:border-(--border-inverse)"
              >
                <li v-for="status in board.statuses" :key="status.id">
                  <span :class="[BADGE_BASE, BADGE.neutral, 'gap-[6px]']">
                    {{ status.name }}
                    <button
                      v-if="canEdit && board.statuses.length > 1"
                      type="button"
                      class="cursor-pointer leading-none text-(--text-muted) hover:text-(--destructive)"
                      :aria-label="`Remover a coluna ${status.name}`"
                      @click="removeColumn(status.id)"
                    >
                      ×
                    </button>
                  </span>
                </li>
                <li v-if="canEdit">
                  <input
                    v-model="newColumn"
                    placeholder="Nova coluna"
                    aria-label="Nova coluna"
                    maxlength="100"
                    class="w-[130px] bg-transparent px-[6px] py-[2px] text-[12.5px] outline-none"
                    @keydown.enter.prevent="addColumn"
                  />
                </li>
              </ul>
              <p class="text-[12px] text-(--text-muted)">
                As colunas são salvas na hora. Uma coluna só sai se não tiver tarefas.
              </p>
            </div>

            <div class="grid gap-[16px] sm:grid-cols-2">
              <label class="grid gap-[6px] text-[13px] font-medium">
                Limite em andamento
                <input
                  v-model="form.wip"
                  type="number"
                  min="1"
                  inputmode="numeric"
                  placeholder="Sem limite"
                  :disabled="!canEdit || !inProgress"
                  :class="[field, 'font-normal']"
                />
              </label>
              <label class="grid gap-[6px] text-[13px] font-medium">
                Visibilidade
                <select
                  v-model="form.isPrivate"
                  :disabled="!canEdit"
                  :class="[field, 'font-normal']"
                >
                  <option :value="true">Somente membros do setor</option>
                  <option :value="false">Toda a organização</option>
                </select>
              </label>
            </div>
          </form>

          <aside
            class="grid gap-[4px] rounded-[16px] border border-(--border-default) bg-(--surface) p-[18px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
          >
            <div class="flex items-center justify-between pb-[8px]">
              <h2 class="text-[15px]! leading-normal! font-semibold! tracking-normal!">
                Membros · {{ access.members.length }}
              </h2>
              <button
                v-if="canEdit"
                type="button"
                class="cursor-pointer text-[13px] font-medium text-(--bg-orange) hover:underline"
                @click="adding = !adding"
              >
                Adicionar
              </button>
            </div>

            <form v-if="adding" class="flex gap-[8px] pb-[8px]" @submit.prevent="addMember">
              <select
                v-model="candidate"
                aria-label="Pessoa da organização"
                :class="[field, 'min-w-0 flex-1']"
              >
                <option value="" disabled>Escolha uma pessoa</option>
                <option v-for="person in candidates" :key="person.user_id" :value="person.user_id">
                  {{ person.name }}
                </option>
              </select>
              <BaseButton
                type="submit"
                label="Adicionar"
                :full-width="false"
                :class="TOOLBAR_BUTTON"
                :disabled="!candidate"
              />
            </form>
            <p
              v-if="adding && !candidates.length"
              class="pb-[8px] text-[12.5px] text-(--text-muted)"
            >
              Todas as pessoas da organização já estão neste setor.
            </p>

            <ul>
              <li
                v-for="member in access.members"
                :key="member.id"
                class="flex items-center gap-[10px] border-b border-(--border-default) py-[10px] last:border-b-0 dark:border-(--border-inverse)"
              >
                <span
                  class="grid size-[30px] shrink-0 place-items-center rounded-full text-[10.5px] leading-none font-semibold text-white"
                  :style="{ backgroundColor: avatar(member.name).color }"
                  aria-hidden="true"
                  >{{ avatar(member.name).initials }}</span
                >
                <span class="flex min-w-0 flex-1 flex-col leading-normal">
                  <span class="truncate text-[13.5px] font-medium">{{ member.name }}</span>
                  <span class="truncate text-[12px] text-(--text-muted)">{{ member.email }}</span>
                </span>
                <select
                  v-if="canEdit"
                  :value="member.role"
                  :aria-label="`Papel de ${member.name}`"
                  class="rounded-[8px] border border-(--border-default) bg-transparent px-[6px] py-[3px] text-[12px] dark:border-(--border-inverse)"
                  @change="
                    changeRole(member.id, ($event.target as HTMLSelectElement).value as SectorRole)
                  "
                >
                  <option v-for="(label, role) in ROLE_LABELS" :key="role" :value="role">
                    {{ label }}
                  </option>
                </select>
                <span v-else :class="[BADGE_BASE, ROLE_TONES[member.role]]">{{
                  ROLE_LABELS[member.role]
                }}</span>
                <button
                  v-if="canEdit"
                  type="button"
                  class="grid size-[26px] cursor-pointer place-items-center rounded-[8px] text-(--text-muted) hover:bg-(--bg-muted) hover:text-(--destructive) dark:hover:bg-white/10"
                  :aria-label="`Remover ${member.name} do setor`"
                  @click="removeMember(member.id)"
                >
                  <span class="material-symbols-outlined text-[16px]!" aria-hidden="true"
                    >close</span
                  >
                </button>
              </li>
            </ul>
          </aside>
        </div>

        <div
          v-if="canEdit"
          class="flex flex-wrap items-center justify-between gap-[12px] rounded-[14px] bg-[#fde8e8] px-[16px] py-[14px] dark:bg-[#dc2626]/15"
        >
          <div class="leading-normal">
            <p class="text-[14px] font-semibold text-[#c42b2b] dark:text-[#ff8a8a]">
              Zona de perigo
            </p>
            <p class="text-[13px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
              Arquivar o setor o esconde da equipe. As tarefas ficam guardadas.
            </p>
          </div>
          <BaseButton
            variant="secondary"
            label="Arquivar setor"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="confirm?.showModal()"
          />
        </div>
      </template>
    </section>

    <dialog
      ref="confirm"
      class="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-(--border-default) bg-(--surface) p-6 text-(--text-primary) dark:border-(--border-inverse) dark:bg-(--surface-inverse) dark:text-(--text-inverse)"
    >
      <h2 class="text-[18px]! font-semibold!">Arquivar {{ sector?.name }}?</h2>
      <p class="mt-2 text-[14px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
        O setor some da lista da equipe. As tarefas dele ficam guardadas.
      </p>
      <div class="mt-5 flex justify-end gap-2">
        <BaseButton
          label="Cancelar"
          variant="ghost"
          :full-width="false"
          class="mt-0!"
          @click="confirm?.close()"
        />
        <BaseButton
          label="Arquivar"
          variant="destructive"
          :full-width="false"
          class="mt-0!"
          @click="archive"
        />
      </div>
    </dialog>
  </div>
</template>
