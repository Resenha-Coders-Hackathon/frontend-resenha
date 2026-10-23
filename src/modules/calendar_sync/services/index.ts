import { api, getErrorMessage } from '@/app/plugins/axios'
import type { UUID } from '@/shared/types'
import type {
  DriveFile,
  DriveTaskLink,
  DriveUploadRequest,
  DriveUploadResult,
  GoogleConnectionStatus,
  TaskCalendarStatus,
} from '../types'

const BASE = '/integrations/google/'

export async function getGoogleStatus(): Promise<GoogleConnectionStatus> {
  try {
    return (await api.get<GoogleConnectionStatus>(BASE)).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível verificar o Google.'))
  }
}

/** Consent URL; `drive` also asks for Google Drive access. */
export async function getGoogleAuthorizeUrl(drive = false): Promise<string> {
  try {
    const params = drive ? { drive: 'true' } : undefined
    return (await api.get<{ url: string }>(`${BASE}authorize/`, { params })).data.url
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível conectar ao Google.'))
  }
}

export async function connectGoogle(code: string, state: string): Promise<void> {
  try {
    await api.post(`${BASE}connect/`, { code, state })
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível concluir a conexão com o Google.'))
  }
}

export async function disconnectGoogle(): Promise<void> {
  try {
    await api.delete(BASE)
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível desconectar o Google.'))
  }
}

export async function listDriveFiles(q = ''): Promise<DriveFile[]> {
  try {
    return (await api.get<DriveFile[]>(`${BASE}drive/files/`, { params: q ? { q } : undefined }))
      .data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível listar os arquivos do Drive.'))
  }
}

export async function uploadToDrive(payload: DriveUploadRequest): Promise<DriveUploadResult> {
  try {
    const body = new FormData()
    body.append('file', payload.file)
    body.append('share_link', String(payload.share_link ?? false))
    if (payload.task) body.append('task', payload.task)
    return (await api.post<DriveUploadResult>(`${BASE}drive/upload/`, body)).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível enviar o arquivo ao Drive.'))
  }
}

export async function attachDriveFile(task: UUID, fileId: string): Promise<DriveTaskLink> {
  try {
    return (await api.post<DriveTaskLink>(`${BASE}drive/attach/`, { task, file_id: fileId })).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível anexar o arquivo à tarefa.'))
  }
}

export async function getTaskCalendarStatus(task: UUID): Promise<TaskCalendarStatus> {
  try {
    return (await api.get<TaskCalendarStatus>(`${BASE}tasks/${task}/`)).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível consultar o Google Calendar.'))
  }
}

/** Adds the task's due date to my calendar, or updates the event when it already exists. */
export async function syncTaskToCalendar(task: UUID): Promise<TaskCalendarStatus> {
  try {
    return (await api.post<TaskCalendarStatus>(`${BASE}tasks/${task}/`)).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível adicionar a tarefa ao calendário.'))
  }
}

export async function removeTaskFromCalendar(task: UUID): Promise<void> {
  try {
    await api.delete(`${BASE}tasks/${task}/`)
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível remover a tarefa do calendário.'))
  }
}
