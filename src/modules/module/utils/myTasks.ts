import type { TaskPriority } from '@/shared/types'
import type { BadgeTone } from './ui'

/* Dados de demonstração de "Minhas tarefas" (não integrado ao backend). */

export type MyTaskStatus = 'todo' | 'doing' | 'done'

export interface MyTask extends Record<string, unknown> {
  id: string
  title: string
  sector: string
  status: MyTaskStatus
  priority: TaskPriority
  due: string
  overdue: boolean
  assignee: string
  createdByMe: boolean
}

export const TASK_STATUS: Record<MyTaskStatus, { label: string; tone: BadgeTone }> = {
  todo: { label: 'A fazer', tone: 'neutral' },
  doing: { label: 'Em andamento', tone: 'warning' },
  done: { label: 'Concluído', tone: 'success' },
}

export const TASK_PRIORITY: Record<TaskPriority, { label: string; tone: BadgeTone }> = {
  low: { label: 'Baixa', tone: 'info' },
  medium: { label: 'Média', tone: 'warning' },
  high: { label: 'Alta', tone: 'danger' },
  urgent: { label: 'Urgente', tone: 'danger' },
}

export const MY_TASKS: MyTask[] = [
  {
    id: 't1',
    title: 'Landing page da campanha',
    sector: 'Marketing',
    status: 'doing',
    priority: 'high',
    due: '26 out',
    overdue: false,
    assignee: 'Beatriz Costa',
    createdByMe: true,
  },
  {
    id: 't2',
    title: 'Roteiro do vídeo (60s)',
    sector: 'Marketing',
    status: 'todo',
    priority: 'high',
    due: '27 out',
    overdue: false,
    assignee: 'Rafael Lima',
    createdByMe: true,
  },
  {
    id: 't3',
    title: 'Sequência de e-mails',
    sector: 'Marketing',
    status: 'doing',
    priority: 'medium',
    due: '29 out',
    overdue: false,
    assignee: 'Marina Souza',
    createdByMe: false,
  },
  {
    id: 't4',
    title: 'Kit de identidade social',
    sector: 'Design',
    status: 'doing',
    priority: 'medium',
    due: '24 out',
    overdue: true,
    assignee: 'Beatriz Costa',
    createdByMe: false,
  },
  {
    id: 't5',
    title: 'Formulário com CRM',
    sector: 'Desenvolvimento',
    status: 'todo',
    priority: 'high',
    due: '28 out',
    overdue: false,
    assignee: 'Gustavo Rocha',
    createdByMe: true,
  },
  {
    id: 't6',
    title: 'Contratar fotógrafo',
    sector: 'Marketing',
    status: 'todo',
    priority: 'medium',
    due: '04 nov',
    overdue: false,
    assignee: 'Camila Alves',
    createdByMe: false,
  },
  {
    id: 't7',
    title: 'Briefing aprovado',
    sector: 'Marketing',
    status: 'done',
    priority: 'high',
    due: '15 out',
    overdue: false,
    assignee: 'Paulo Artur',
    createdByMe: true,
  },
]
