export interface FileUploadRequest {
  file: File
}
export interface FileUploadResponse {
  url: string
  public_id: string
}

export type FileOrigin = 'drive' | 'docs' | 'meet' | 'upload' | 'link'

/** GET /organizations/:id/files/ — anexos da organização, dos setores e das tarefas. */
export interface OrganizationFile {
  id: string
  title: string
  url: string
  origin: FileOrigin
  task_title: string | null
  sector_name: string | null
  owner_name: string
  created_at: string
}
