import type { ISODateTime, UUID } from '@/shared/types'

export interface GoogleAuthUrlResponse {
  url: string
}
export interface GoogleConnectRequest {
  code: string
  state: string
}
export interface GoogleConnectionStatus {
  connected: boolean
  /** True when the connection also allows Google Drive. */
  drive: boolean
}
export interface DriveFile {
  id: string
  name: string
  mime_type: string
  size_bytes: number | null
  web_view_link: string
  modified_at: ISODateTime | null
}
/** Same shape as the kanban ResourceLink returned by the backend. */
export interface DriveTaskLink {
  id: UUID
  title: string
  url: string
  created_by_id: UUID
  created_at: ISODateTime
}
export interface DriveUploadResult {
  file: DriveFile
  link: DriveTaskLink | null
}
export interface DriveUploadRequest {
  file: File
  /** Anyone with the link can read the file. */
  share_link?: boolean
  /** Also attach the file to this task as a link. */
  task?: UUID
}
