import type { FileOrigin } from '../types'
import type { BadgeTone } from './ui'

export const FILE_ORIGINS: Record<FileOrigin, { label: string; tab: string; tone: BadgeTone }> = {
  drive: { label: 'Drive', tab: 'Google Drive', tone: 'success' },
  docs: { label: 'Docs', tab: 'Google Docs', tone: 'info' },
  upload: { label: 'Upload', tab: 'Uploads', tone: 'neutral' },
  meet: { label: 'Meet', tab: 'Gravações do Meet', tone: 'accent' },
  link: { label: 'Link', tab: 'Links', tone: 'outline' },
}
