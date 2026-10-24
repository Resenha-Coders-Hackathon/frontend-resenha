<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { getErrorMessage } from '@/app/plugins/axios'
import { BaseButton } from '@/shared/components'
import { relativeTime } from '@/shared/utils/time'
import { ensureGoogleConnected, useGoogleStore } from '@/modules/calendar_sync'
import type { DriveFile, DriveTaskLink } from '@/modules/calendar_sync'

/* Integrações do Google da tarefa: evento no Google Agenda e arquivos do Drive. */
const props = defineProps<{ taskId: string; dueDate: string; canEdit: boolean }>()
const emit = defineEmits<{ attached: [link: DriveTaskLink] }>()

const google = useGoogleStore()
const query = ref('')
const picking = ref(false)
const busy = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const synced = computed(() => google.calendar[props.taskId])
const returnTo = () => window.location.pathname

onMounted(async () => {
  await google.loadStatus()
  if (google.status.connected) await google.loadTaskCalendar(props.taskId)
})
watch(
  () => props.taskId,
  () => {
    picking.value = false
    query.value = ''
    if (google.status.connected) void google.loadTaskCalendar(props.taskId)
  },
)

async function connect(drive = false) {
  try {
    await ensureGoogleConnected({ drive, returnTo: returnTo() })
  } catch (error) {
    toast.error(getErrorMessage(error, 'Não foi possível conectar ao Google.'))
  }
}

async function guarded(name: string, action: () => Promise<unknown>, failure: string) {
  busy.value = name
  try {
    await action()
  } catch (error) {
    toast.error(getErrorMessage(error, failure))
  } finally {
    busy.value = ''
  }
}

const addToCalendar = () =>
  guarded(
    'calendar',
    async () => {
      if (await google.addTaskToCalendar(props.taskId))
        toast.success(synced.value?.synced ? 'Evento atualizado.' : 'Tarefa no Google Agenda.')
      else toast.error(google.error)
    },
    'Não foi possível usar o Google Agenda.',
  )

const removeFromCalendar = () =>
  guarded(
    'calendar',
    async () => {
      if (await google.removeTaskFromCalendarEvent(props.taskId)) toast.success('Evento removido.')
      else toast.error(google.error)
    },
    'Não foi possível remover o evento.',
  )

async function openPicker() {
  picking.value = !picking.value
  if (picking.value) await search()
}
const search = () =>
  guarded('files', () => google.loadFiles(query.value.trim()), 'Não foi possível listar o Drive.')

const attach = (file: DriveFile) =>
  guarded(
    `attach-${file.id}`,
    async () => {
      const link = await google.attach(props.taskId, file.id)
      if (!link) return toast.error(google.error)
      emit('attached', link)
      toast.success(`${file.name} anexado.`)
    },
    'Não foi possível anexar o arquivo.',
  )

const upload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  void guarded(
    'upload',
    async () => {
      const result = await google.upload({ file, share_link: true, task: props.taskId })
      if (!result) return toast.error(google.error)
      if (result.link) emit('attached', result.link)
      toast.success(`${file.name} enviado ao Drive.`)
    },
    'Não foi possível enviar o arquivo.',
  )
}

const fileIcon = (mime: string) =>
  mime.startsWith('image/')
    ? 'image'
    : mime.includes('pdf')
      ? 'picture_as_pdf'
      : mime.includes('sheet')
        ? 'table_chart'
        : mime.includes('folder')
          ? 'folder'
          : 'description'
const size = (bytes: number | null) =>
  bytes === null
    ? ''
    : bytes > 1_048_576
      ? `${(bytes / 1_048_576).toFixed(1)} MB`
      : `${Math.max(1, Math.round(bytes / 1024))} KB`

const card =
  'grid gap-3 rounded-xl border border-(--border-default) p-3.5 dark:border-(--border-inverse)'
</script>

<template>
  <div class="grid gap-3">
    <!-- Google Agenda -->
    <div :class="card">
      <div class="flex items-center gap-3">
        <span
          class="material-symbols-outlined grid size-8 shrink-0 place-items-center rounded-lg bg-[#2563eb1f] text-[18px]! text-[#2563eb]"
          aria-hidden="true"
          >event</span
        >
        <div class="min-w-0 flex-1">
          <p class="text-[13.5px] font-medium">Google Agenda</p>
          <p class="text-[12px] text-(--text-muted)" role="status">
            <template v-if="!google.status.connected"
              >Conecte para levar a entrega para a sua agenda.</template
            >
            <template v-else-if="!dueDate"
              >Defina uma data de entrega para criar o evento.</template
            >
            <template v-else-if="synced?.synced">
              No seu Google Agenda
              <template v-if="synced.last_synced_at">
                · atualizado {{ relativeTime(synced.last_synced_at) }}</template
              >
            </template>
            <template v-else>A entrega ainda não está na sua agenda.</template>
          </p>
        </div>
        <BaseButton
          v-if="!google.status.connected"
          label="Conectar"
          variant="ghost"
          size="sm"
          :full-width="false"
          @click="connect()"
        />
        <div v-else-if="canEdit && dueDate" class="flex gap-1.5">
          <BaseButton
            v-if="synced?.synced"
            label="Remover"
            variant="ghost"
            size="sm"
            :full-width="false"
            :loading="busy === 'calendar'"
            @click="removeFromCalendar"
          />
          <BaseButton
            :label="synced?.synced ? 'Atualizar' : 'Adicionar'"
            :variant="synced?.synced ? 'ghost' : 'primary'"
            size="sm"
            :full-width="false"
            :loading="busy === 'calendar'"
            @click="addToCalendar"
          />
        </div>
      </div>
    </div>

    <!-- Google Drive -->
    <div :class="card">
      <div class="flex items-center gap-3">
        <span
          class="material-symbols-outlined grid size-8 shrink-0 place-items-center rounded-lg bg-[#1e9e5a1f] text-[18px]! text-[#1e9e5a]"
          aria-hidden="true"
          >folder</span
        >
        <div class="min-w-0 flex-1">
          <p class="text-[13.5px] font-medium">Google Drive</p>
          <p class="text-[12px] text-(--text-muted)">
            {{
              google.status.drive
                ? 'Anexe arquivos e imagens do seu Drive ou envie um novo.'
                : 'Conecte o Drive para anexar arquivos e imagens à tarefa.'
            }}
          </p>
        </div>
        <BaseButton
          v-if="!google.status.drive"
          label="Conectar Drive"
          variant="ghost"
          size="sm"
          :full-width="false"
          @click="connect(true)"
        />
        <div v-else-if="canEdit" class="flex gap-1.5">
          <input
            ref="fileInput"
            type="file"
            class="sr-only"
            tabindex="-1"
            aria-label="Arquivo para enviar ao Drive"
            @change="upload"
          />
          <BaseButton
            label="Enviar"
            icon="upload"
            icon-position="left"
            variant="ghost"
            size="sm"
            :full-width="false"
            :loading="busy === 'upload'"
            @click="fileInput?.click()"
          />
          <BaseButton
            :label="picking ? 'Fechar' : 'Escolher'"
            :variant="picking ? 'ghost' : 'primary'"
            size="sm"
            :full-width="false"
            @click="openPicker"
          />
        </div>
      </div>

      <div v-if="picking && google.status.drive" class="grid gap-2">
        <form class="flex gap-2" @submit.prevent="search">
          <input
            v-model="query"
            type="search"
            placeholder="Buscar no Drive"
            aria-label="Buscar no Drive"
            class="h-9 flex-1 rounded-lg border border-(--border-default) bg-transparent px-2 text-[13px] dark:border-(--border-inverse)"
          />
          <BaseButton
            label="Buscar"
            variant="ghost"
            size="sm"
            :full-width="false"
            type="submit"
            :loading="busy === 'files'"
          />
        </form>
        <ul class="grid max-h-56 gap-1 overflow-y-auto">
          <li
            v-for="file in google.files"
            :key="file.id"
            class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-(--bg-subtle) dark:hover:bg-white/5"
          >
            <span
              class="material-symbols-outlined text-[20px]! text-(--text-muted)"
              aria-hidden="true"
              >{{ fileIcon(file.mime_type) }}</span
            >
            <span class="min-w-0 flex-1">
              <span class="block truncate text-[13px]">{{ file.name }}</span>
              <span class="block text-[11.5px] text-(--text-muted)">{{
                size(file.size_bytes)
              }}</span>
            </span>
            <BaseButton
              label="Anexar"
              variant="ghost"
              size="sm"
              :full-width="false"
              :loading="busy === `attach-${file.id}`"
              @click="attach(file)"
            />
          </li>
          <li
            v-if="!google.files.length && busy !== 'files'"
            class="px-2 py-3 text-center text-[13px] text-(--text-muted)"
          >
            Nenhum arquivo encontrado.
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
