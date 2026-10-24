import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { UUID } from '@/shared/types'
import {
  attachDriveFile,
  disconnectGoogle,
  getGoogleStatus,
  getTaskCalendarStatus,
  listDriveFiles,
  removeTaskFromCalendar,
  syncTaskToCalendar,
  uploadToDrive,
} from '../services'
import type {
  DriveFile,
  DriveTaskLink,
  DriveUploadRequest,
  DriveUploadResult,
  GoogleConnectionStatus,
  TaskCalendarStatus,
} from '../types'

export const useGoogleStore = defineStore('google', () => {
  const status = ref<GoogleConnectionStatus>({ connected: false, drive: false })
  const files = ref<DriveFile[]>([])
  const isLoading = ref(false)
  const error = ref('')
  // by task id: is it in my Google Calendar?
  const calendar = ref<Record<UUID, TaskCalendarStatus>>({})

  async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
    error.value = ''
    isLoading.value = true
    try {
      return await action()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erro na integração com o Google.'
    } finally {
      isLoading.value = false
    }
  }

  async function loadStatus(): Promise<void> {
    const loaded = await run(getGoogleStatus)
    if (loaded) status.value = loaded
  }

  async function disconnect(): Promise<void> {
    const done = await run(async () => {
      await disconnectGoogle()
      return true
    })
    if (!done) return
    status.value = { connected: false, drive: false }
    files.value = []
  }

  async function loadFiles(q = ''): Promise<void> {
    const loaded = await run(() => listDriveFiles(q))
    if (loaded) files.value = loaded
  }

  async function upload(payload: DriveUploadRequest): Promise<DriveUploadResult | undefined> {
    const result = await run(() => uploadToDrive(payload))
    if (result) files.value = [result.file, ...files.value.filter((f) => f.id !== result.file.id)]
    return result
  }

  async function attach(task: UUID, fileId: string): Promise<DriveTaskLink | undefined> {
    return run(() => attachDriveFile(task, fileId))
  }

  async function loadTaskCalendar(task: UUID): Promise<void> {
    const loaded = await run(() => getTaskCalendarStatus(task))
    if (loaded) calendar.value[task] = loaded
  }

  /** Adds or updates the task's due-date event; returns false when it failed (see `error`). */
  async function addTaskToCalendar(task: UUID): Promise<boolean> {
    const synced = await run(() => syncTaskToCalendar(task))
    if (synced) calendar.value[task] = synced
    return !!synced
  }

  async function removeTaskFromCalendarEvent(task: UUID): Promise<boolean> {
    const done = await run(async () => {
      await removeTaskFromCalendar(task)
      return true
    })
    if (done) calendar.value[task] = { synced: false, last_synced_at: null }
    return !!done
  }

  function reset(): void {
    calendar.value = {}
    status.value = { connected: false, drive: false }
    files.value = []
    error.value = ''
    isLoading.value = false
  }

  return {
    status,
    files,
    calendar,
    loadTaskCalendar,
    addTaskToCalendar,
    removeTaskFromCalendarEvent,
    isLoading,
    error,
    loadStatus,
    disconnect,
    loadFiles,
    upload,
    attach,
    reset,
  }
})
