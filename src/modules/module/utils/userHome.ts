import type { BadgeTone } from './ui'

/* Dados de demonstração da home do usuário (não integrado ao backend). */

export const HOME_KPIS = [
  { title: 'Minhas tarefas abertas', data: '6', description: '2 vencem esta semana' },
  { title: 'Concluídas na semana', data: '9', description: '+3 em relação à anterior' },
  { title: 'Atrasadas', data: '1', description: 'Kit de identidade social' },
  { title: 'Créditos de IA', data: '312/500', description: 'Renova em 01/11' },
]

export interface TodayItem {
  id: string
  icon: string
  title: string
  meta: string
  badge: string
  tone: BadgeTone
}

export const TODAY: TodayItem[] = [
  {
    id: 'd1',
    icon: 'view_kanban',
    title: 'Revisar landing page com Beatriz',
    meta: 'Marketing · FLX-142',
    badge: 'Hoje',
    tone: 'warning',
  },
  {
    id: 'd2',
    icon: 'view_kanban',
    title: 'Aprovar verba de mídia',
    meta: 'Marketing · FLX-155',
    badge: 'Atrasada',
    tone: 'danger',
  },
  {
    id: 'd3',
    icon: 'view_kanban',
    title: 'Responder cliente sobre o evento',
    meta: 'Comercial · FLX-160',
    badge: 'Amanhã',
    tone: 'neutral',
  },
  {
    id: 'd4',
    icon: 'calendar_today',
    title: 'Reunião de revisão (Meet)',
    meta: 'ter, 28 out · 15:00',
    badge: 'Agendado',
    tone: 'info',
  },
]

export const ACTIVITY = [
  { id: 'a1', person: 'Beatriz Costa', text: 'Beatriz comentou em FLX-142', when: 'há 12 min' },
  {
    id: 'a2',
    person: 'Paulo Artur',
    text: 'IA criou 3 tarefas a partir da ata',
    when: 'há 40 min',
  },
  {
    id: 'a3',
    person: 'Gustavo Rocha',
    text: 'Gustavo moveu FLX-140 para Concluído',
    when: 'há 1 h',
  },
  { id: 'a4', person: 'Camila Alves', text: 'Camila pagou a fatura #0481', when: 'ontem' },
]

export const WEEKLY_DONE = {
  labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
  values: [5, 7, 6, 8, 9, 10],
}

export const OPEN_BY_SECTOR = {
  labels: ['Mkt', 'Design', 'Dev', 'Fin', 'Com'],
  values: [14, 9, 21, 4, 6],
}
