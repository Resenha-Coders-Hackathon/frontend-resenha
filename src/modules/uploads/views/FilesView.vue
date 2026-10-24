<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { toast } from 'vue-sonner'
import { BaseButton, SubheaderComp, TopbarComp } from '@/shared/components'
import { FILE_ORIGINS, FILES, type FileItem, type FileOrigin } from '../utils/mocks'
import { avatar, BADGE, BADGE_BASE, TOOLBAR_BUTTON } from '../utils/ui'

// Página só de interface: "Enviar arquivo" adiciona o arquivo só na lista local, sem upload.

const files = ref<FileItem[]>([...FILES])
const tab = ref<'all' | FileOrigin>('all')
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

const tabs = [
  { id: 'all' as const, label: 'Todos' },
  ...(Object.keys(FILE_ORIGINS) as FileOrigin[]).map((id) => ({ id, label: FILE_ORIGINS[id].tab })),
]

const rows = computed(() =>
  tab.value === 'all' ? files.value : files.value.filter((file) => file.origin === tab.value),
)
const COLUMNS = ['Nome', 'Origem', 'Tarefa', 'Atualizado', 'Dono']

function addFiles(event: Event) {
  const input = event.target as HTMLInputElement
  for (const file of input.files ?? []) {
    files.value.unshift({
      id: `local-${crypto.randomUUID()}`,
      name: file.name,
      origin: 'upload',
      task: '—',
      updated: 'agora',
      owner: 'Paulo Artur',
    })
  }
  if (input.files?.length) toast.success('Arquivo adicionado à lista (demonstração, sem upload).')
  input.value = ''
}
</script>

<template>
  <div
    class="flex min-h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp :crumbs="['Arquivos']" />

    <section class="flex flex-1 flex-col gap-[16px] px-[16px] pt-[24px] pb-[32px] sm:px-[28px]">
      <SubheaderComp
        title="Arquivos"
        description="Tudo que foi anexado às tarefas, de todas as origens"
        class="mb-0!"
      >
        <div class="flex flex-wrap gap-[8px]">
          <BaseButton
            variant="secondary"
            label="Conectar Drive"
            icon="folder"
            icon-position="left"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="toast.success('A conexão com o Google Drive ainda não está integrada.')"
          />
          <BaseButton
            label="Enviar arquivo"
            icon="upload"
            icon-position="left"
            :full-width="false"
            :class="TOOLBAR_BUTTON"
            @click="fileInput?.click()"
          />
          <input ref="fileInput" type="file" multiple class="hidden" @change="addFiles" />
        </div>
      </SubheaderComp>

      <div
        role="tablist"
        aria-label="Filtrar por origem"
        class="flex gap-[22px] overflow-x-auto border-b border-(--border-default) dark:border-(--border-inverse)"
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
              <td class="px-[18px] py-[12px] font-semibold">{{ file.name }}</td>
              <td class="px-[18px] py-[12px]">
                <span :class="[BADGE_BASE, BADGE[FILE_ORIGINS[file.origin].tone]]">{{
                  FILE_ORIGINS[file.origin].label
                }}</span>
              </td>
              <td class="px-[18px] py-[12px] font-mono text-[12px]">{{ file.task }}</td>
              <td
                class="px-[18px] py-[12px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
              >
                {{ file.updated }}
              </td>
              <td class="px-[18px] py-[12px]">
                <span class="flex items-center gap-[8px]">
                  <span
                    :class="[
                      'grid size-[24px] shrink-0 place-items-center rounded-full text-[9px] leading-none font-semibold text-white',
                      avatar(file.owner).color
                        ? ''
                        : 'bg-(--text-primary) dark:bg-(--text-inverse) dark:text-(--text-primary)',
                    ]"
                    :style="{ backgroundColor: avatar(file.owner).color || undefined }"
                    aria-hidden="true"
                    >{{ avatar(file.owner).initials }}</span
                  >
                  {{ file.owner }}
                </span>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td
                :colspan="COLUMNS.length"
                class="px-[18px] py-[28px] text-center text-[13px] text-(--text-muted)"
              >
                Nenhum arquivo desta origem.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
