import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { UUID } from '@/shared/types'
import {
  attachDriveFile,
  disconnectGoogle,
  getGoogleStatus,
  listDriveFiles,
  uploadToDrive,
} from '../services'
import type {
  DriveFile,
  DriveTaskLink,
  DriveUploadRequest,
  DriveUploadResult,
  GoogleConnectionStatus,
} from '../types'

export const useGoogleStore = defineStore('google', () => {
  const status = ref<GoogleConnectionStatus>({ connected: false, drive: false })
  const files = ref<DriveFile[]>([])
  const isLoading = ref(false)
  const error = ref('')

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

  function reset(): void {
    status.value = { connected: false, drive: false }
    files.value = []
    error.value = ''
    isLoading.value = false
  }

  return {
    status,
    files,
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
