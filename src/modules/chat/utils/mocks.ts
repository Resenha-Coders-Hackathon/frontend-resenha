import type {
  AssistantEntry,
  AssistantHistoryItem,
  ChatChannel,
  DemoAttachment,
  DemoMessage,
} from '../types'

/* Dados de demonstração: a tela ainda não está integrada ao backend. */

export const CURRENT_USER = { id: 'u-paulo', name: 'Paulo Artur' }

// horário relativo a hoje, para "Ontem"/"Hoje" sempre baterem com a data real
function at(daysAgo: number, time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hours ?? 0, minutes ?? 0, 0, 0)
  return date.toISOString()
}

function sector(
  id: string,
  name: string,
  author: string,
  content: string,
  created: string,
  unread = 0,
): ChatChannel {
  return {
    id,
    kind: 'sector',
    name,
    team_id: null,
    team_ids: [],
    sector_id: `s-${id}`,
    unread_count: unread,
    member_count: 8,
    online: null,
    last_message: {
      id: `lm-${id}`,
      author_name: author,
      content,
      has_attachments: false,
      created_at: created,
    },
  }
}

function direct(
  id: string,
  name: string,
  content: string,
  created: string,
  online: boolean,
  unread = 0,
): ChatChannel {
  return {
    id,
    kind: 'direct',
    name,
    team_id: null,
    team_ids: [],
    sector_id: null,
    unread_count: unread,
    member_count: 2,
    online,
    last_message: {
      id: `lm-${id}`,
      author_name: name,
      content,
      has_attachments: false,
      created_at: created,
    },
  }
}

export const CHANNELS: ChatChannel[] = [
  sector(
    'marketing',
    'marketing',
    'Marina Souza',
    'Marquei a revisão com o cliente na terça às 15h.',
    at(0, '10:41'),
  ),
  sector('design', 'design', 'Beatriz Costa', 'subi os templates no Drive', at(0, '09:58'), 2),
  sector(
    'desenvolvimento',
    'desenvolvimento',
    'Gustavo Rocha',
    'deploy de staging ok',
    at(0, '09:12'),
  ),
  sector('financeiro', 'financeiro', 'Camila Alves', 'fatura #0482 enviada', at(1, '17:30')),
  direct('rafael', 'Rafael Lima', 'Te mandei o roteiro, dá uma olhada?', at(0, '11:03'), true, 3),
  direct('beatriz', 'Beatriz Costa', 'Combinado!', at(0, '10:20'), true),
  direct('gustavo', 'Gustavo Rocha', 'Você: valeu, vou revisar', at(1, '18:02'), false),
  direct('camila', 'Camila Alves', 'O orçamento do fotógrafo chegou', at(4, '15:10'), false),
]

export const MEETING_NOTES: DemoAttachment = {
  id: 'f-ata',
  file_name: 'Ata — reunião de lançamento.pdf',
  mime_type: 'application/pdf',
  size_bytes: 412 * 1024,
  url: '#',
  pages: 3,
}

function message(
  id: string,
  channel: string,
  author: [string, string],
  content: string,
  created: string,
  extra: Partial<DemoMessage> = {},
): DemoMessage {
  return {
    id,
    channel_id: channel,
    author_id: author[0],
    author_name: author[1],
    content,
    reply_to_id: null,
    task: null,
    mentions: [],
    attachments: [],
    created_at: created,
    edited_at: null,
    deleted_at: null,
    ...extra,
  }
}

const BEATRIZ: [string, string] = ['u-beatriz', 'Beatriz Costa']
const MARINA: [string, string] = ['u-marina', 'Marina Souza']
const RAFAEL: [string, string] = ['u-rafael', 'Rafael Lima']
const GUSTAVO: [string, string] = ['u-gustavo', 'Gustavo Rocha']
const ME: [string, string] = [CURRENT_USER.id, CURRENT_USER.name]

export const MESSAGES: Record<string, DemoMessage[]> = {
  marketing: [
    message(
      'm1',
      'marketing',
      BEATRIZ,
      'Pessoal, a versão mobile da landing está no Drive. Comentem direto na tarefa.',
      at(1, '16:18'),
      {
        task: {
          id: 't-142',
          code: 'FLX-142',
          title: 'Landing page da campanha de lançamento',
          sector_id: 's-marketing',
          status: 'Em revisão',
          completed: false,
        },
      },
    ),
    message(
      'm2',
      'marketing',
      MARINA,
      'Marquei a revisão com o cliente na terça às 15h. Segue a ata da reunião de ontem para alguém transformar em tarefas.',
      at(0, '10:41'),
      { attachments: [MEETING_NOTES] },
    ),
    message(
      'm3',
      'marketing',
      ME,
      'Joguei a ata no Assistente, ele gerou 5 tarefas. Já revisei e adicionei 3 no board.',
      at(0, '10:44'),
    ),
    message(
      'm4',
      'marketing',
      RAFAEL,
      'Boa! Fico com a lista de convidados. @Camila Alves consegue liberar o sinal do fotógrafo esta semana?',
      at(0, '11:03'),
      { mentions: [{ id: 'u-camila', name: 'Camila Alves' }] },
    ),
  ],
  design: [
    message(
      'd1',
      'design',
      BEATRIZ,
      'Subi os templates no Drive, revisem quando puderem.',
      at(0, '09:58'),
    ),
  ],
  desenvolvimento: [
    message('dv1', 'desenvolvimento', GUSTAVO, 'Deploy de staging ok.', at(0, '09:12')),
  ],
  rafael: [message('r1', 'rafael', RAFAEL, 'Te mandei o roteiro, dá uma olhada?', at(0, '11:03'))],
  beatriz: [message('b1', 'beatriz', BEATRIZ, 'Combinado!', at(0, '10:20'))],
}

export const TYPING: Record<string, string> = { marketing: 'Camila Alves' }

export const AI_CREDITS = { used: 312, total: 500, renewsAt: '01/11' }

export const ASSISTANT_HISTORY: AssistantHistoryItem[] = [
  { id: 'h1', title: 'Ata — reunião de lançamento' },
  { id: 'h2', title: 'Checklist de onboarding de cliente' },
  { id: 'h3', title: 'Briefing campanha Black Friday' },
  { id: 'h4', title: 'Bugs do relatório de QA (PDF)' },
]

export const ASSISTANT_CONVERSATION: AssistantEntry[] = [
  {
    id: 'a1',
    kind: 'user',
    time: '10:43',
    content:
      'Crie as tarefas do evento de lançamento a partir desta ata. Use os responsáveis citados e prazos antes de 14/11.',
    attachment: MEETING_NOTES,
  },
  {
    id: 'a2',
    kind: 'assistant',
    time: '10:43',
    duration: '6 s',
    content: 'Sugiro estas 5 tarefas para a coluna A fazer:',
    steps: [
      { id: 's1', label: 'Li 3 páginas e encontrei 7 itens de ação' },
      { id: 's2', label: 'Associei 5 responsáveis do setor Marketing' },
      { id: 's3', label: 'Descartei 2 itens já existentes no board (FLX-139, FLX-142)' },
    ],
    tasks: [
      {
        id: 'st1',
        title: 'Contratar fotógrafo para o evento de 14/11',
        assignee: 'Camila Alves',
        due: '05 nov',
        priority: 'medium',
        integration: { label: 'Pagamento', icon: 'credit_card' },
        selected: true,
      },
      {
        id: 'st2',
        title: 'Fechar lista e envio dos convites',
        assignee: 'Rafael Lima',
        due: '07 nov',
        priority: 'low',
        integration: null,
        selected: true,
      },
      {
        id: 'st3',
        title: 'Reservar espaço e confirmar buffet',
        assignee: 'Marina Souza',
        due: '31 out',
        priority: 'high',
        integration: { label: 'Pagamento', icon: 'credit_card' },
        selected: true,
      },
      {
        id: 'st4',
        title: 'Press kit para imprensa local',
        assignee: 'Beatriz Costa',
        due: '10 nov',
        priority: 'medium',
        integration: { label: 'Drive', icon: 'folder' },
        selected: true,
      },
      {
        id: 'st5',
        title: 'Agendar ensaio da apresentação',
        assignee: 'Paulo Artur',
        due: '12 nov',
        priority: 'low',
        integration: { label: 'Meet', icon: 'videocam' },
        selected: true,
      },
    ],
  },
  {
    id: 'a3',
    kind: 'user',
    time: '10:44',
    content: 'Adiciona só as 3 primeiras e coloca a do buffet como prioridade alta.',
  },
  {
    id: 'a4',
    kind: 'assistant',
    time: '10:44',
    content:
      'Pronto. Adicionei FLX-151, FLX-152 e FLX-153 em A fazer e avisei Camila, Rafael e Marina no #marketing.',
    actions: true,
  },
]

export const ASSISTANT_PROMPTS = [
  'Quebre esta tarefa em subtarefas',
  'Crie tarefas a partir deste e-mail',
  'Redistribua o que está atrasado',
]
