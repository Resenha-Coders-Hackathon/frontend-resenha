<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '@/app/plugins/axios'
import { BaseButton, CardComp, SubheaderComp, TopbarComp } from '@/shared/components'
import { avatar } from '@/shared/utils/people'
import { relativeTime } from '@/shared/utils/time'
import { fetchAllPages } from '@/shared/utils'
import { useAuthStore } from '@/modules/auth'
import { listOnlineMembers } from '@/modules/chat'
import { listInvitations, type Invitation } from '@/modules/invitations'
import { getDashboard, listSectorMembers, useSectorsStore, type Dashboard } from '@/modules/module'
import { roleLabels, useOrganizationsStore } from '@/modules/organizations'
import { getReport, type Report } from '@/modules/reports'
import { BADGE, BADGE_BASE, TOOLBAR_BUTTON } from '../utils/ui'

const router = useRouter()
const auth = useAuthStore()
const organizations = useOrganizationsStore()
const sectors = useSectorsStore()

type Tab = 'members' | 'sectors' | 'invites'
const tab = ref<Tab>('members')
const loading = ref(false)
const online = ref<string[]>([])
const report = ref<Report | null>(null)
const dashboard = ref<Dashboard | null>(null)
const invitations = ref<Invitation[] | null>(null) // null: sem permissão para ver
const sectorNamesByUser = ref<Record<string, string[]>>({})
const sectorMemberCount = ref<Record<string, number>>({})

const organization = computed(() => organizations.current)
const canManage = computed(() =>
  ['owner', 'admin'].includes(organization.value?.current_role ?? ''),
)
const openTasks = computed(() => {
  const byUser: Record<string, number> = {}
  for (const person of report.value?.people ?? []) byUser[person.user_id] = person.open
  return byUser
})
const openBySector = computed(() => {
  const bySector: Record<string, number> = {}
  for (const row of dashboard.value?.open_by_sector ?? []) bySector[row.sector] = row.open
  return bySector
})
const busiestSector = computed(() => dashboard.value?.open_by_sector[0]?.sector)

const pending = computed(() => (invitations.value ?? []).filter((i) => i.status === 'pending'))
const tabs = computed(() => [
  { id: 'members' as const, label: 'Membros', count: organizations.members.length },
  { id: 'sectors' as const, label: 'Setores', count: sectors.sectors.length },
  ...(canManage.value
    ? [{ id: 'invites' as const, label: 'Convites pendentes', count: pending.value.length }]
    : []),
])

const roleTone = {
  owner: BADGE.ink,
  admin: BADGE.accent,
  member: BADGE.outline,
  viewer: BADGE.neutral,
}

let request = 0
async function load() {
  const current = organization.value
  const id = ++request
  tab.value = 'members'
  invitations.value = null
  if (!current) return
  loading.value = true
  try {
    await Promise.all([organizations.loadMembers(current.id), sectors.load(current.id)])
    const [people, presence, summary, week, invites] = await Promise.all([
      Promise.all(
        sectors.sectors.map((s) => fetchAllPages((page) => listSectorMembers(s.id, page))),
      ),
      listOnlineMembers(current.id).catch(() => []),
      getDashboard(current.id).catch(() => null),
      getReport(current.id, 7).catch(() => null),
      canManage.value
        ? fetchAllPages((page) => listInvitations(current.id, page)).catch(() => null)
        : null,
    ])
    if (id !== request) return
    const names: Record<string, string[]> = {}
    const counts: Record<string, number> = {}
    sectors.sectors.forEach((sector, index) => {
      counts[sector.id] = people[index]!.length
      for (const member of people[index]!) (names[member.user_id] ??= []).push(sector.name)
    })
    sectorNamesByUser.value = names
    sectorMemberCount.value = counts
    online.value = presence
    dashboard.value = summary
    report.value = week
    invitations.value = invites
  } catch (error) {
    if (id === request) toast.error(getErrorMessage(error, 'Não foi possível carregar a equipe.'))
  } finally {
    if (id === request) loading.value = false
  }
}
watch(() => organization.value?.id, load, { immediate: true })

const COLUMNS = ['Pessoa', 'Setores', 'Papel', 'Tarefas abertas', 'Status']

const goMembers = (invite = false) =>
  organization.value &&
  router.push({
    name: 'OrganizationMembers',
    params: { organizationId: organization.value.id },
    query: invite ? { convidar: '1' } : {},
  })
const goNewSector = () =>
  organization.value &&
  router.push({
    name: 'OrganizationOnboardingSectors',
    params: { organizationId: organization.value.id },
  })
const editSector = (id: string) => router.push({ name: 'SectorEdit', params: { id } })
</script>

<template>
  <div
    class="flex min-h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp :crumbs="['Equipe e setores']" />

    <section class="flex flex-1 flex-col gap-[16px] px-[16px] pt-[24px] pb-[32px] sm:px-[28px]">
      <SubheaderComp
        title="Equipe e setores"
        :description="`${organization?.name ?? ''} · quem participa de cada setor e o que pode fazer`"
        class="mb-0!"
      >
        <div v-if="canManage" class="flex flex-wrap gap-[8px]">
          <BaseButton
            variant="secondary"
            label="Gerenciar membros"
            icon="manage_accounts"
            icon-position="left"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="goMembers()"
          />
          <BaseButton
            label="Convidar pessoas"
            icon="add"
            icon-position="left"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="goMembers(true)"
          />
        </div>
      </SubheaderComp>

      <div
        role="tablist"
        aria-label="Seções da equipe"
        class="flex gap-[22px] overflow-x-auto overflow-y-hidden border-b border-(--border-default) dark:border-(--border-inverse)"
      >
        <button
          v-for="item in tabs"
          :key="item.id"
          type="button"
          role="tab"
          :aria-selected="tab === item.id"
          :class="[
            '-mb-px flex shrink-0 cursor-pointer items-center gap-[6px] border-b-2 py-[10px] text-[14px] leading-normal font-medium whitespace-nowrap transition-colors',
            tab === item.id
              ? 'border-(--text-primary) dark:border-(--text-inverse)'
              : 'border-transparent text-(--text-muted) hover:text-(--text-secondary)',
          ]"
          @click="tab = item.id"
        >
          {{ item.label }}
          <span
            class="rounded-[5px] bg-(--bg-muted) px-[5px] font-mono text-[10.5px] leading-[16px] text-(--text-secondary) dark:bg-white/10 dark:text-(--text-inverse-muted)"
            >{{ item.count }}</span
          >
        </button>
      </div>

      <template v-if="tab === 'members'">
        <div class="grid gap-[12px] sm:grid-cols-2 xl:grid-cols-4">
          <CardComp
            title="Membros"
            :data="organizations.members.length"
            :description="`${online.length} online agora`"
          />
          <CardComp
            title="Setores"
            :data="sectors.sectors.length"
            :description="
              busiestSector ? `${busiestSector} tem mais tarefas abertas` : 'sem tarefas abertas'
            "
          />
          <CardComp
            title="Concluídas em 7 dias"
            :data="report?.completed ?? 0"
            :description="`${report?.completed_previous ?? 0} nos 7 dias anteriores`"
          />
          <CardComp
            title="Atrasadas"
            :data="report?.overdue ?? 0"
            :description="report?.overdue ? 'veja em Relatórios' : 'nenhuma atrasada'"
            :tone="report?.overdue ? 'bad' : undefined"
          />
        </div>
      </template>

      <div v-if="tab !== 'invites'" class="grid gap-[12px] sm:grid-cols-2 xl:grid-cols-4">
        <button
          v-for="sector in sectors.sectors"
          :key="sector.id"
          type="button"
          class="flex cursor-pointer flex-col gap-[12px] rounded-[16px] border border-(--border-default) bg-(--surface) p-[14px] text-left transition-colors hover:border-(--text-muted) dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
          :aria-label="`Editar setor ${sector.name}`"
          @click="editSector(sector.id)"
        >
          <span class="flex items-center gap-[10px]">
            <span
              class="grid size-[32px] shrink-0 place-items-center rounded-[9px]"
              :style="{
                backgroundColor: `${sector.color || '#8a857d'}1f`,
                color: sector.color || '#8a857d',
              }"
              aria-hidden="true"
            >
              <span class="material-symbols-outlined text-[18px]!">{{
                sector.icon || 'workspaces'
              }}</span>
            </span>
            <span class="flex min-w-0 flex-col leading-normal">
              <span class="truncate text-[14px] font-semibold">{{ sector.name }}</span>
              <span class="text-[12px] text-(--text-muted)"
                >{{ sectorMemberCount[sector.id] ?? 0 }}
                {{ sectorMemberCount[sector.id] === 1 ? 'membro' : 'membros' }}</span
              >
            </span>
          </span>
          <span class="flex items-center justify-between text-[12px] text-(--text-muted)">
            <span v-if="sector.is_private" class="inline-flex items-center gap-[4px]">
              <span class="material-symbols-outlined text-[14px]!" aria-hidden="true">lock</span>
              Privado
            </span>
            <span v-else>Aberto à organização</span>
            <span class="font-mono">{{ openBySector[sector.name] ?? 0 }} abertas</span>
          </span>
        </button>
        <button
          v-if="canManage"
          type="button"
          class="flex min-h-[96px] cursor-pointer items-center justify-center gap-[8px] rounded-[16px] border border-dashed border-(--text-muted) text-[13.5px] text-(--text-secondary) transition-colors hover:border-(--text-primary) dark:text-(--text-inverse-muted)"
          @click="goNewSector"
        >
          <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">add</span>
          Novo setor
        </button>
      </div>

      <section
        v-if="tab !== 'sectors'"
        class="overflow-x-auto rounded-[16px] border border-(--border-default) bg-(--surface) dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
      >
        <table v-if="tab === 'members'" class="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr
              class="border-b border-(--border-default) bg-(--bg-subtle) dark:border-(--border-inverse) dark:bg-black/20"
            >
              <th
                v-for="column in COLUMNS"
                :key="column"
                scope="col"
                class="px-[18px] py-[9px] text-[12px] leading-normal font-normal text-(--text-secondary) dark:text-(--text-inverse-muted)"
              >
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="member in organizations.members"
              :key="member.id"
              class="border-b border-(--border-default) text-[13px] leading-normal last:border-b-0 dark:border-(--border-inverse)"
            >
              <td class="px-[18px] py-[12px]">
                <span class="flex items-center gap-[10px]">
                  <span
                    class="grid size-[28px] shrink-0 place-items-center rounded-full text-[10px] leading-none font-semibold text-white"
                    :style="{ backgroundColor: avatar(member.name).color }"
                    aria-hidden="true"
                    >{{ avatar(member.name).initials }}</span
                  >
                  <span class="flex min-w-0 flex-col">
                    <span class="flex items-center gap-[6px] font-semibold">
                      {{ member.name }}
                      <span
                        v-if="member.user_id === auth.user?.id"
                        :class="[BADGE_BASE, BADGE.neutral, 'font-mono']"
                        >você</span
                      >
                    </span>
                    <span class="truncate text-[12px] text-(--text-muted)">{{ member.email }}</span>
                  </span>
                </span>
              </td>
              <td class="px-[18px] py-[12px]">
                <span class="flex flex-wrap gap-[4px]">
                  <span
                    v-for="name in sectorNamesByUser[member.user_id] ?? []"
                    :key="name"
                    :class="[BADGE_BASE, BADGE.neutral]"
                    >{{ name }}</span
                  >
                  <span
                    v-if="!sectorNamesByUser[member.user_id]?.length"
                    class="text-(--text-muted)"
                    >—</span
                  >
                </span>
              </td>
              <td class="px-[18px] py-[12px]">
                <span :class="[BADGE_BASE, roleTone[member.role]]">{{
                  roleLabels[member.role]
                }}</span>
              </td>
              <td class="px-[18px] py-[12px] font-mono">{{ openTasks[member.user_id] ?? 0 }}</td>
              <td class="px-[18px] py-[12px]">
                <span class="flex items-center gap-[6px]">
                  <span
                    :class="[
                      'size-[7px] rounded-full',
                      online.includes(member.user_id) ? 'bg-[#15924a]' : 'bg-(--text-muted)',
                    ]"
                    aria-hidden="true"
                  ></span>
                  {{ online.includes(member.user_id) ? 'Online' : 'Offline' }}
                </span>
              </td>
            </tr>
            <tr v-if="!organizations.members.length">
              <td
                :colspan="COLUMNS.length"
                class="px-[18px] py-[28px] text-center text-[13px] text-(--text-muted)"
              >
                {{ loading ? 'Carregando equipe…' : 'Nenhum membro nesta organização.' }}
              </td>
            </tr>
          </tbody>
        </table>

        <table v-else class="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr
              class="border-b border-(--border-default) bg-(--bg-subtle) dark:border-(--border-inverse) dark:bg-black/20"
            >
              <th
                v-for="column in ['E-mail', 'Papel', 'Enviado', 'Expira']"
                :key="column"
                scope="col"
                class="px-[18px] py-[9px] text-[12px] leading-normal font-normal text-(--text-secondary) dark:text-(--text-inverse-muted)"
              >
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="invite in pending"
              :key="invite.id"
              class="border-b border-(--border-default) text-[13px] leading-normal last:border-b-0 dark:border-(--border-inverse)"
            >
              <td class="px-[18px] py-[12px] font-semibold">{{ invite.email }}</td>
              <td class="px-[18px] py-[12px]">
                <span :class="[BADGE_BASE, roleTone[invite.role]]">{{
                  roleLabels[invite.role]
                }}</span>
              </td>
              <td class="px-[18px] py-[12px] text-(--text-secondary)">
                {{ relativeTime(invite.created_at) }}
              </td>
              <td class="px-[18px] py-[12px] text-(--text-secondary)">
                {{ new Date(invite.expires_at).toLocaleDateString('pt-BR') }}
              </td>
            </tr>
            <tr v-if="!pending.length">
              <td
                colspan="4"
                class="px-[18px] py-[28px] text-center text-[13px] text-(--text-muted)"
              >
                {{ loading ? 'Carregando convites…' : 'Nenhum convite pendente.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </section>
  </div>
</template>
