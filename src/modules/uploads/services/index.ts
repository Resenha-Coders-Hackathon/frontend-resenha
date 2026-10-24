import { api, getErrorMessage } from '@/app/plugins/axios'
import type { FileUploadResponse, OrganizationFile } from '../types'

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // limite do backend

/** Generic upload (Cloudinary). Rejects locally files over the backend limit. */
export async function uploadFile(file: File): Promise<FileUploadResponse> {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('O arquivo pode ter no máximo 10 MB.')
  try {
    const body = new FormData()
    body.append('file', file)
    return (await api.post<FileUploadResponse>('/uploads/', body)).data
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível enviar o arquivo.'))
  }
}

export async function listFiles(organizationId: string): Promise<OrganizationFile[]> {
  const path = `/organizations/${encodeURIComponent(organizationId)}/files/`
  return (await api.get<OrganizationFile[]>(path)).data
}

/** Registra um arquivo já enviado como anexo da própria organização. */
export async function attachToOrganization(
  organizationId: string,
  payload: { title: string; url: string },
): Promise<void> {
  try {
    await api.post(`/organizations/${encodeURIComponent(organizationId)}/links/`, payload)
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Não foi possível anexar o arquivo.'))
  }
}
