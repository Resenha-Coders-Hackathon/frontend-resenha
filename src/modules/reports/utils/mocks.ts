/* Dados de demonstração de relatórios (não integrado ao backend). */

export interface PersonPerformance extends Record<string, unknown> {
  id: string
  name: string
  done: number
  onTime: number
  open: number
  late: number
}

export const PERIODS = ['Últimos 7 dias', 'Últimos 30 dias', 'Últimos 90 dias']

export const KPIS = [
  { title: 'Tarefas concluídas', data: '128', description: '+18% vs. setembro', tone: 'positive' },
  {
    title: 'Tempo médio até concluir',
    data: '3,4 dias',
    description: '−0,6 dia',
    tone: 'negative',
  },
  { title: 'Entregas no prazo', data: '87%', description: '+5 p.p.', tone: 'positive' },
  {
    title: 'Tarefas criadas por IA',
    data: '41',
    description: '32% do total',
    tone: 'muted',
    ai: true,
  },
] as const

export const WEEKLY_DONE = {
  labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
  values: [14, 19, 17, 22, 26, 30],
}

export const LATE_BY_SECTOR = [
  { label: 'Mkt', value: 6 },
  { label: 'Design', value: 2 },
  { label: 'Dev', value: 10 },
  { label: 'Fin', value: 1 },
  { label: 'Com', value: 3 },
]

export const PEOPLE: PersonPerformance[] = [
  { id: 'ms', name: 'Marina Souza', done: 24, onTime: 92, open: 5, late: 0 },
  { id: 'bc', name: 'Beatriz Costa', done: 21, onTime: 88, open: 3, late: 1 },
  { id: 'gr', name: 'Gustavo Rocha', done: 19, onTime: 79, open: 7, late: 2 },
  { id: 'rl', name: 'Rafael Lima', done: 15, onTime: 90, open: 4, late: 0 },
]
