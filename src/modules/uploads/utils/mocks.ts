import type { BadgeTone } from './ui'

/* Dados de demonstração da página de arquivos (não integrado ao backend). */

export type FileOrigin = 'drive' | 'docs' | 'upload' | 'meet'

export interface FileItem extends Record<string, unknown> {
  id: string
  name: string
  origin: FileOrigin
  task: string
  updated: string
  owner: string
}

export const FILE_ORIGINS: Record<FileOrigin, { label: string; tab: string; tone: BadgeTone }> = {
  drive: { label: 'Drive', tab: 'Google Drive', tone: 'success' },
  docs: { label: 'Docs', tab: 'Google Docs', tone: 'info' },
  upload: { label: 'Upload', tab: 'Uploads', tone: 'neutral' },
  meet: { label: 'Meet', tab: 'Gravações do Meet', tone: 'accent' },
}

export const FILES: FileItem[] = [
  {
    id: 'f1',
    name: 'Assets_campanha_v3',
    origin: 'drive',
    task: 'FLX-142',
    updated: 'há 2 h',
    owner: 'Beatriz Costa',
  },
  {
    id: 'f2',
    name: 'Copy da landing — final',
    origin: 'docs',
    task: 'FLX-142',
    updated: 'há 2 h',
    owner: 'Beatriz Costa',
  },
  {
    id: 'f3',
    name: 'Ata — reunião de lançamento.pdf',
    origin: 'upload',
    task: 'FLX-151',
    updated: 'hoje',
    owner: 'Marina Souza',
  },
  {
    id: 'f4',
    name: 'Roteiro vídeo 60s',
    origin: 'docs',
    task: 'FLX-148',
    updated: 'ontem',
    owner: 'Rafael Lima',
  },
  {
    id: 'f5',
    name: 'Kickoff — gravação',
    origin: 'meet',
    task: 'FLX-136',
    updated: '14 out',
    owner: 'Marina Souza',
  },
  {
    id: 'f6',
    name: 'Orçamento fotógrafo.pdf',
    origin: 'upload',
    task: 'FLX-151',
    updated: '22 out',
    owner: 'Camila Alves',
  },
  {
    id: 'f7',
    name: 'Paleta e tipografia',
    origin: 'drive',
    task: 'FLX-144',
    updated: '19 out',
    owner: 'Beatriz Costa',
  },
]
