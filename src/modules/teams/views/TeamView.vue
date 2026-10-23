<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { BaseButton, CardComp, SubheaderComp, TopbarComp } from '@/shared/components'
import {
  MEMBERS,
  memberById,
  ORG_STATS,
  ROLES,
  SECTOR_MEMBER_COUNT,
  SECTORS,
  STATUSES,
} from '../utils/mocks'
import { avatar, BADGE, BADGE_BASE, TOOLBAR_BUTTON } from '../utils/ui'

// Página só de interface: dados de exemplo, sem backend.

const router = useRouter()
const tab = ref('members')

const tabs: { id: string; label: string; count?: number }[] = [
  { id: 'members', label: 'Membros', count: ORG_STATS.members },
  { id: 'sectors', label: 'Setores', count: ORG_STATS.sectors },
  { id: 'invites', label: 'Convites pendentes', count: ORG_STATS.pendingInvites },
  { id: 'permissions', label: 'Permissões' },
]

const rows = computed(() =>
  tab.value === 'invites' ? MEMBERS.filter((member) => member.status === 'invited') : MEMBERS,
)

const COLUMNS = ['Pessoa', 'Setores', 'Papel', 'Tarefas abertas', 'Status', 'Último acesso']

function editSector(id: string) {
  router.push({ name: 'SectorEdit', params: { id } })
}
</script>

<template>
  <div
    class="flex min-h-[calc(100dvh-3.5rem)] w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp :crumbs="['Norte Studio', 'Equipe e setores']" has-notifications />

    <section class="flex flex-1 flex-col gap-[16px] px-[16px] pt-[24px] pb-[32px] sm:px-[28px]">
      <SubheaderComp
        title="Equipe e setores"
        description="Norte Studio · gerencie quem participa de cada setor e o que pode fazer"
        class="mb-0!"
      >
        <div class="flex flex-wrap gap-[8px]">
          <BaseButton
            variant="secondary"
            label="Organização"
            icon="domain"
            icon-position="left"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="router.push('/organizacoes')"
          />
          <BaseButton
            label="Convidar pessoas"
            icon="add"
            icon-position="left"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="toast.success('Convites ainda não estão integrados nesta tela.')"
          />
        </div>
      </SubheaderComp>

      <div
        role="tablist"
        aria-label="Seções da equipe"
        class="flex gap-[22px] overflow-x-auto border-b border-(--border-default) dark:border-(--border-inverse)"
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
            v-if="item.count !== undefined"
            class="rounded-[5px] bg-(--bg-muted) px-[5px] font-mono text-[10.5px] leading-[16px] text-(--text-secondary) dark:bg-white/10 dark:text-(--text-inverse-muted)"
            >{{ item.count }}</span
          >
        </button>
      </div>

      <template v-if="tab !== 'permissions'">
        <div v-if="tab === 'members'" class="grid gap-[12px] sm:grid-cols-2 xl:grid-cols-4">
          <CardComp
            title="Membros ativos"
            :data="ORG_STATS.activeMembers"
            :description="`de ${ORG_STATS.seats} assentos no plano Pro`"
          />
          <CardComp
            title="Setores"
            :data="ORG_STATS.sectors"
            description="Desenvolvimento tem mais tarefas abertas"
          />
          <CardComp
            title="Concluídas na semana"
            :data="ORG_STATS.doneThisWeek"
            description="+12 em relação à anterior"
          />
          <CardComp
            title="Atrasadas"
            :data="ORG_STATS.late"
            description="3 sem responsável definido"
          />
        </div>

        <div v-if="tab !== 'invites'" class="grid gap-[12px] sm:grid-cols-2 xl:grid-cols-4">
          <button
            v-for="sector in SECTORS"
            :key="sector.id"
            type="button"
            class="flex cursor-pointer flex-col gap-[12px] rounded-[16px] border border-(--border-default) bg-(--surface) p-[14px] text-left transition-colors hover:border-(--text-muted) dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
            :aria-label="`Editar setor ${sector.name}`"
            @click="editSector(sector.id)"
          >
            <span class="flex items-center gap-[10px]">
              <span
                class="grid size-[32px] shrink-0 place-items-center rounded-[9px]"
                :style="{ backgroundColor: `${sector.color}1f`, color: sector.color }"
                aria-hidden="true"
              >
                <span class="material-symbols-outlined text-[18px]!">{{ sector.icon }}</span>
              </span>
              <span class="flex flex-col leading-normal">
                <span class="text-[14px] font-semibold">{{ sector.name }}</span>
                <span class="text-[12px] text-(--text-muted)"
                  >{{ SECTOR_MEMBER_COUNT[sector.id] }} membros</span
                >
              </span>
            </span>
            <span class="flex items-center justify-between">
              <span class="flex -space-x-[6px]">
                <span
                  v-for="id in sector.members.slice(0, 3)"
                  :key="id"
                  :class="[
                    'grid size-[22px] place-items-center rounded-full text-[8px] leading-none font-semibold text-white ring-2 ring-(--surface) dark:ring-(--surface-inverse)',
                    avatar(memberById(id)?.name ?? '').color
                      ? ''
                      : 'bg-(--text-primary) dark:bg-(--text-inverse) dark:text-(--text-primary)',
                  ]"
                  :style="{
                    backgroundColor: avatar(memberById(id)?.name ?? '').color || undefined,
                  }"
                  aria-hidden="true"
                  >{{ avatar(memberById(id)?.name ?? '').initials }}</span
                >
              </span>
              <span
                class="font-mono text-[11.5px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
                >{{ sector.openTasks }} abertas</span
              >
            </span>
          </button>
          <button
            type="button"
            class="flex min-h-[96px] cursor-pointer items-center justify-center gap-[6px] rounded-[16px] border border-dashed border-(--text-muted) text-[13.5px] text-(--text-secondary) transition-colors hover:bg-(--surface) dark:text-(--text-inverse-muted) dark:hover:bg-white/5"
            @click="toast.success('Criação de setores ainda não está integrada.')"
          >
            <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">add</span>
            Novo setor
          </button>
        </div>

        <div
          v-if="tab !== 'sectors'"
          class="overflow-hidden rounded-[16px] border border-(--border-default) bg-(--surface) dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
        >
          <div class="overflow-x-auto">
            <table class="w-full min-w-[900px] border-collapse text-left">
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
                  v-for="member in rows"
                  :key="member.id"
                  class="border-b border-(--border-default) text-[13px] leading-normal last:border-b-0 dark:border-(--border-inverse)"
                >
                  <td class="px-[18px] py-[11px]">
                    <span class="flex items-center gap-[10px]">
                      <span
                        :class="[
                          'grid size-[28px] shrink-0 place-items-center rounded-full text-[10px] leading-none font-semibold text-white',
                          avatar(member.name).color
                            ? ''
                            : 'bg-(--text-primary) dark:bg-(--text-inverse) dark:text-(--text-primary)',
                        ]"
                        :style="{ backgroundColor: avatar(member.name).color || undefined }"
                        aria-hidden="true"
                        >{{ avatar(member.name).initials }}</span
                      >
                      <span class="flex min-w-0 flex-col">
                        <span class="flex items-center gap-[6px] font-medium">
                          {{ member.name }}
                          <span
                            v-if="member.isMe"
                            :class="[BADGE_BASE, BADGE.neutral, 'font-mono text-[10.5px]']"
                            >você</span
                          >
                        </span>
                        <span class="text-[12px] text-(--text-muted)">{{ member.email }}</span>
                      </span>
                    </span>
                  </td>
                  <td class="px-[18px] py-[11px]">
                    <span class="flex flex-wrap gap-[4px]">
                      <span
                        v-for="sector in member.sectors"
                        :key="sector"
                        :class="[BADGE_BASE, BADGE.neutral, 'font-mono text-[10.5px]']"
                        >{{ sector }}</span
                      >
                    </span>
                  </td>
                  <td class="px-[18px] py-[11px]">
                    <span :class="[BADGE_BASE, BADGE[ROLES[member.role].tone]]">{{
                      ROLES[member.role].label
                    }}</span>
                  </td>
                  <td class="px-[18px] py-[11px] font-mono text-[12px]">{{ member.openTasks }}</td>
                  <td class="px-[18px] py-[11px]">
                    <span class="flex items-center gap-[6px]">
                      <span
                        :class="['size-[7px] rounded-full', STATUSES[member.status].dot]"
                        aria-hidden="true"
                      ></span>
                      {{ STATUSES[member.status].label }}
                    </span>
                  </td>
                  <td
                    class="px-[18px] py-[11px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
                  >
                    {{ member.lastSeen }}
                  </td>
                </tr>
                <tr v-if="!rows.length">
                  <td
                    :colspan="COLUMNS.length"
                    class="px-[18px] py-[28px] text-center text-[13px] text-(--text-muted)"
                  >
                    Nenhum convite pendente.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-if="tab === 'members'"
            class="flex items-center justify-between gap-[12px] border-t border-(--border-default) px-[18px] py-[12px] dark:border-(--border-inverse)"
          >
            <span class="text-[12.5px] text-(--text-muted)"
              >Mostrando {{ rows.length }} de {{ ORG_STATS.members }}</span
            >
            <span class="flex gap-[8px]">
              <BaseButton
                variant="secondary"
                label="Anterior"
                :full-width="false"
                disabled
                :class="[TOOLBAR_BUTTON, 'h-[34px]!']"
              />
              <BaseButton
                variant="secondary"
                label="Próxima"
                :full-width="false"
                :class="[TOOLBAR_BUTTON, 'h-[34px]!']"
              />
            </span>
          </div>
        </div>
      </template>

      <section
        v-else
        class="flex flex-col gap-[8px] rounded-[16px] border border-(--border-default) bg-(--surface) px-[18px] py-[16px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
      >
        <h2 class="text-[15px]! leading-normal! font-semibold! tracking-normal!">Permissões</h2>
        <p
          class="text-[13px] leading-[20px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
        >
          Admins gerenciam a organização e o faturamento. Gestores editam o próprio setor e seus
          membros. Membros criam e movem tarefas. Convidados só veem os setores para os quais foram
          chamados.
        </p>
      </section>
    </section>
  </div>
</template>
