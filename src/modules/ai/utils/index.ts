import type { AiAction, AiPerson, AiTask, AiTaskDraft } from '../types'

/** DRF field errors and tool failures can contain nested lists and dictionaries. */
export function aiErrorDetails(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(aiErrorDetails).filter(Boolean).join(' ')
  if (value && typeof value === 'object') {
    if ('detail' in value) {
      const file = 'file' in value && typeof value.file === 'string' ? value.file : ''
      const reason = 'reason' in value ? aiErrorDetails(value.reason) : ''
      return [file, aiErrorDetails(value.detail), reason].filter(Boolean).join(': ')
    }
    return Object.entries(value)
      .filter(([key]) => key !== 'index')
      .map(([, item]) => aiErrorDetails(item))
      .filter(Boolean)
      .join(' ')
  }
  return ''
}

const VERBS: Record<string, string> = {
  create: 'criada',
  update: 'atualizada',
  delete: 'excluída',
  move: 'movida',
  get: 'consultada',
  list: 'listadas',
}
const NOUNS: Record<string, string> = {
  task: 'Tarefa',
  sector: 'Setor',
  status: 'Coluna',
  team: 'Equipe',
  checklist: 'Item do checklist',
  comment: 'Comentário',
  organization: 'Organização',
  invitation: 'Convite',
  link: 'Link',
  event: 'Evento',
  calendar: 'Calendário',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

/** Human title for a receipt, e.g. `task_create` -> "Tarefa criada". */
export function aiActionLabel(action: AiAction): string {
  const [domain = '', verb = ''] = action.action.split('_')
  const noun = NOUNS[domain]
  const done = VERBS[verb]
  if (noun && done) return verb === 'list' ? `${noun}s ${done}` : `${noun} ${done}`
  return action.action.replaceAll('_', ' ')
}

export function aiActionTone(action: AiAction): 'ok' | 'pending' | 'error' {
  if (action.status === 'succeeded') return 'ok'
  return action.status === 'confirmation_required' ? 'pending' : 'error'
}

function looksLikeTask(value: unknown): value is AiTask {
  return isRecord(value) && typeof value.id === 'string' && typeof value.title === 'string'
    && 'priority' in value
}

/** Tasks in a successful receipt: a single result or a paginated `results` list. */
export function aiActionTasks(action: AiAction): AiTask[] {
  if (action.status !== 'succeeded' || !action.action.startsWith('task_')) return []
  const result = action.result
  if (looksLikeTask(result)) return [result]
  if (isRecord(result) && Array.isArray(result.results)) return result.results.filter(looksLikeTask)
  return []
}

export function aiActionDeleted(action: AiAction): boolean {
  return action.status === 'succeeded' && action.action.endsWith('_delete')
}

/** Failed reads are noise for the user; failed or uncertain writes must stay visible. */
export function aiVisibleActions(actions: AiAction[] | undefined): AiAction[] {
  return (actions ?? []).filter((a) => a.writes || a.status !== 'failed')
}

/** Server-written notes (e.g. what the board could not store); never model text. */
export function aiActionNotes(action: AiAction): string[] {
  const result = action.result
  if (action.status !== 'succeeded' || !isRecord(result) || !Array.isArray(result.notes)) return []
  return result.notes.filter((note): note is string => typeof note === 'string')
}

/** The draft card payload of a successful `task_draft` receipt. */
export function aiActionDraft(action: AiAction): AiTaskDraft | null {
  if (action.action !== 'task_draft' || action.status !== 'succeeded') return null
  const draft = action.result
  return isRecord(draft) && draft.kind === 'task_draft' ? (draft as unknown as AiTaskDraft) : null
}

function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

/** People whose name starts with every word of the query ("nicole" -> "Nicole Souza"). */
export function matchPeople(query: string, people: AiPerson[]): AiPerson[] {
  const tokens = fold(query)
    .split(/\s+/)
    .filter((t) => t && !['usuario', 'user', 'o', 'a', 'do', 'da'].includes(t))
  if (!tokens.length) return []
  return people.filter((person) => {
    const words = fold(person.name).split(/\s+/)
    return tokens.every((token) => words.some((word) => word.startsWith(token)))
  })
}
