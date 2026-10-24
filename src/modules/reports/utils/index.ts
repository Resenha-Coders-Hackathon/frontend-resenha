import type { Report } from '../types'

export interface Kpi {
  title: string
  data: string
  description: string
  tone?: 'good' | 'bad'
}

const number = (value: number, digits = 0) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

// "−0,6" com o sinal tipográfico; zero não leva sinal
const signed = (value: number, digits = 0) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${number(Math.abs(value), digits)}`

const toneOf = (change: number, higherIsBetter: boolean): Kpi['tone'] =>
  change === 0 ? undefined : change > 0 === higherIsBetter ? 'good' : 'bad'

export function kpis(report: Report): Kpi[] {
  const completed = report.completed
  const previous = report.completed_previous
  const completedChange = previous
    ? {
        description: `${signed(Math.round((100 * (completed - previous)) / previous))}% vs. período anterior`,
        tone: toneOf(completed - previous, true),
      }
    : { description: 'sem tarefas concluídas no período anterior', tone: undefined }

  const time = report.avg_days_to_complete
  const timeBefore = report.avg_days_previous
  const timeChange =
    time !== null && timeBefore !== null
      ? {
          description: `${signed(Math.round((time - timeBefore) * 10) / 10, 1)} dia vs. período anterior`,
          tone: toneOf(time - timeBefore, false),
        }
      : { description: 'sem conclusões para comparar', tone: undefined }

  const onTime = report.on_time_pct
  const onTimeBefore = report.on_time_pct_previous
  const onTimeChange =
    onTime !== null && onTimeBefore !== null
      ? {
          description: `${signed(onTime - onTimeBefore)} p.p.`,
          tone: toneOf(onTime - onTimeBefore, true),
        }
      : { description: 'sem prazos para comparar', tone: undefined }

  return [
    { title: 'Tarefas concluídas', data: number(completed), ...completedChange },
    {
      title: 'Tempo médio até concluir',
      data: time === null ? '—' : `${number(time, 1)} dias`,
      ...timeChange,
    },
    { title: 'Entregas no prazo', data: onTime === null ? '—' : `${onTime}%`, ...onTimeChange },
    {
      title: 'Em aberto',
      data: number(report.open),
      description: report.overdue ? `${report.overdue} atrasadas` : 'nenhuma atrasada',
      tone: report.overdue ? 'bad' : undefined,
    },
  ]
}

const cell = (value: string | number) =>
  /[;"\n]/.test(String(value)) ? `"${String(value).replaceAll('"', '""')}"` : String(value)

/** CSV com ponto e vírgula (o Excel em português abre direto) e BOM para os acentos. */
export function peopleCsv(people: Report['people']): string {
  const lines = [
    ['pessoa', 'concluidas', 'no_prazo', 'abertas', 'atrasadas'],
    ...people.map((p) => [
      p.name,
      p.completed,
      p.on_time_pct === null ? '' : `${p.on_time_pct}%`,
      p.open,
      p.overdue,
    ]),
  ]
  return `﻿${lines.map((line) => line.map(cell).join(';')).join('\n')}`
}

export const periods: { days: Report['days']; label: string }[] = [
  { days: 7, label: 'Últimos 7 dias' },
  { days: 30, label: 'Últimos 30 dias' },
  { days: 90, label: 'Últimos 90 dias' },
]
