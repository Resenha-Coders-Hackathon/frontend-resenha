<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '@/app/plugins/axios'
import { BaseButton, SubheaderComp, TopbarComp } from '@/shared/components'
import { avatar } from '@/shared/utils/people'
import { relativeTime } from '@/shared/utils/time'
import { ensureGoogleConnected, useGoogleStore } from '@/modules/calendar_sync'
import { useOrganizationsStore } from '@/modules/organizations'
import { attachToOrganization, listFiles, uploadFile } from '../services'
import type { FileOrigin, OrganizationFile } from '../types'
import { FILE_ORIGINS } from '../utils/origins'
import { BADGE, BADGE_BASE, TOOLBAR_BUTTON } from '../utils/ui'

const organizations = useOrganizationsStore()
const google = useGoogleStore()

const files = ref<OrganizationFile[]>([])
const loading = ref(false)
const uploading = ref(false)
const tab = ref<'all' | FileOrigin>('all')
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

const tabs = [
  { id: 'all' as const, label: 'Todos' },
  ...(Object.keys(FILE_ORIGINS) as FileOrigin[]).map((id) => ({ id, label: FILE_ORIGINS[id].tab })),
]
const rows = computed(() =>
  tab.value === 'all' ? files.value : files.value.filter((file) => file.origin === tab.value),
)
const COLUMNS = ['Nome', 'Origem', 'Anexado em', 'Atualizado', 'Dono']

let request = 0
async function load() {
  const organization = organizations.current
  const current = ++request
  files.value = []
  if (!organization) return
  loading.value = true
  try {
    const loaded = await listFiles(organization.id)
    if (current === request) files.value = loaded
  } catch (error) {
    if (current === request)
      toast.error(getErrorMessage(error, 'Não foi possível carregar os arquivos.'))
  } finally {
    if (current === request) loading.value = false
  }
}

watch(() => organizations.current?.id, load, { immediate: true })
onMounted(() => void google.loadStatus())

async function sendFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const organization = organizations.current
  const selected = [...(input.files ?? [])]
  input.value = ''
  if (!organization || !selected.length) return

  uploading.value = true
  let sent = 0
  for (const file of selected) {
    try {
      const { url } = await uploadFile(file)
      await attachToOrganization(organization.id, { title: file.name, url })
      sent += 1
    } catch (error) {
      toast.error(
        `${file.name}: ${error instanceof Error ? error.message : 'não foi possível enviar.'}`,
      )
    }
  }
  uploading.value = false
  if (sent) {
    toast.success(sent === 1 ? 'Arquivo enviado.' : `${sent} arquivos enviados.`)
    await load()
  }
}

async function connectDrive() {
  try {
    await ensureGoogleConnected({ drive: true, returnTo: '/arquivos' })
  } catch (error) {
    toast.error(getErrorMessage(error, 'Não foi possível conectar o Google Drive.'))
  }
}

const where = (file: OrganizationFile) => file.task_title ?? file.sector_name ?? 'Organização'
</script>

<template>
  <div
    class="flex min-h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp :crumbs="['Arquivos']" />

    <section
      class="flex flex-1 flex-col gap-[16px] px-[20px] pt-[24px] pb-[32px] sm:px-[36px] xl:px-[44px]"
    >
      <SubheaderComp
        title="Arquivos"
        description="Tudo que foi anexado à organização, aos setores e às tarefas"
        class="mb-0!"
      >
        <div class="flex flex-wrap gap-[8px]">
          <BaseButton
            v-if="google.status.drive"
            variant="secondary"
            label="Drive conectado"
            icon="check"
            icon-position="left"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            disabled
          />
          <BaseButton
            v-else
            variant="secondary"
            label="Conectar Drive"
            icon="folder"
            icon-position="left"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="connectDrive"
          />
          <BaseButton
            label="Enviar arquivo"
            icon="upload"
            icon-position="left"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            :loading="uploading"
            @click="fileInput?.click()"
          />
          <input ref="fileInput" type="file" multiple class="hidden" @change="sendFiles" />
        </div>
      </SubheaderComp>

      <div
        role="tablist"
        aria-label="Filtrar por origem"
        class="flex gap-[22px] overflow-x-auto overflow-y-hidden border-b border-(--border-default) dark:border-(--border-inverse)"
      >
        <button
          v-for="item in tabs"
          :key="item.id"
          type="button"
          role="tab"
          :aria-selected="tab === item.id"
          :class="[
            '-mb-px shrink-0 cursor-pointer border-b-2 py-[10px] text-[14px] leading-normal font-medium whitespace-nowrap transition-colors',
            tab === item.id
              ? 'border-(--text-primary) dark:border-(--text-inverse)'
              : 'border-transparent text-(--text-muted) hover:text-(--text-secondary)',
          ]"
          @click="tab = item.id"
        >
          {{ item.label }}
        </button>
      </div>

      <div
        class="overflow-x-auto rounded-[16px] border border-(--border-default) bg-(--surface) dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
      >
        <table class="w-full min-w-[720px] border-collapse text-left">
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
              v-for="file in rows"
              :key="file.id"
              class="border-b border-(--border-default) text-[13px] leading-normal last:border-b-0 dark:border-(--border-inverse)"
            >
              <td class="max-w-[320px] px-[18px] py-[12px] font-semibold">
                <a
                  :href="file.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block truncate hover:underline"
                  :title="file.title"
                  >{{ file.title }}</a
                >
              </td>
              <td class="px-[18px] py-[12px]">
                <span :class="[BADGE_BASE, BADGE[FILE_ORIGINS[file.origin].tone]]">{{
                  FILE_ORIGINS[file.origin].label
                }}</span>
              </td>
              <td class="max-w-[240px] truncate px-[18px] py-[12px]" :title="where(file)">
                {{ where(file) }}
              </td>
              <td
                class="px-[18px] py-[12px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
              >
                {{ relativeTime(file.created_at) }}
              </td>
              <td class="px-[18px] py-[12px]">
                <span class="flex items-center gap-[8px]">
                  <span
                    class="grid size-[24px] shrink-0 place-items-center rounded-full text-[9px] leading-none font-semibold text-white"
                    :style="{ backgroundColor: avatar(file.owner_name).color }"
                    aria-hidden="true"
                    >{{ avatar(file.owner_name).initials }}</span
                  >
                  {{ file.owner_name }}
                </span>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td
                :colspan="COLUMNS.length"
                class="px-[18px] py-[28px] text-center text-[13px] text-(--text-muted)"
              >
                {{
                  loading
                    ? 'Carregando arquivos…'
                    : tab === 'all'
                      ? 'Nenhum arquivo ainda. Anexe arquivos às tarefas ou envie um para a organização.'
                      : 'Nenhum arquivo desta origem.'
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
