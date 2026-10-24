import type { BadgeTone } from './ui'

/* Dados de demonstração de equipe e setores (não integrado ao backend). */

export type MemberRole = 'admin' | 'manager' | 'member' | 'guest'
export type MemberStatus = 'online' | 'away' | 'offline' | 'invited'

export interface OrgMember extends Record<string, unknown> {
  id: string
  name: string
  email: string
  sectors: string[]
  role: MemberRole
  openTasks: number
  status: MemberStatus
  lastSeen: string
  isMe: boolean
}

export interface Sector {
  id: string
  name: string
  icon: string
  color: string
  members: string[]
  openTasks: number
  managerId: string
  description: string
  columns: string[]
  wipLimit: number
  visibility: string
}

export const ROLES: Record<MemberRole, { label: string; tone: BadgeTone; detail: string }> = {
  admin: { label: 'Admin', tone: 'ink', detail: 'Admin da organização' },
  manager: { label: 'Gestor', tone: 'accent', detail: 'Gestor' },
  member: { label: 'Membro', tone: 'outline', detail: 'Membro' },
  guest: { label: 'Convidado', tone: 'dashed', detail: 'Convidado externo' },
}

export const STATUSES: Record<MemberStatus, { label: string; dot: string }> = {
  online: { label: 'Online', dot: 'bg-[#1e9e5a]' },
  away: { label: 'Ausente', dot: 'bg-[#d97706]' },
  offline: { label: 'Offline', dot: 'bg-(--text-muted)' },
  invited: { label: 'Convite pendente', dot: 'bg-[#2563eb]' },
}

export const SECTOR_COLORS = ['#f0541e', '#7c4dff', '#2563eb', '#1e9e5a', '#d97706', '#0e9488']

export const MEMBERS: OrgMember[] = [
  {
    id: 'pa',
    name: 'Paulo Artur',
    email: 'paulo@norte.studio',
    sectors: ['Produto', 'Marketing'],
    role: 'admin',
    openTasks: 6,
    status: 'online',
    lastSeen: 'agora',
    isMe: true,
  },
  {
    id: 'ms',
    name: 'Marina Souza',
    email: 'marina@norte.studio',
    sectors: ['Marketing'],
    role: 'manager',
    openTasks: 5,
    status: 'online',
    lastSeen: 'há 4 min',
    isMe: false,
  },
  {
    id: 'rl',
    name: 'Rafael Lima',
    email: 'rafael@norte.studio',
    sectors: ['Marketing', 'Comercial'],
    role: 'member',
    openTasks: 4,
    status: 'away',
    lastSeen: 'há 1 h',
    isMe: false,
  },
  {
    id: 'bc',
    name: 'Beatriz Costa',
    email: 'beatriz@norte.studio',
    sectors: ['Design'],
    role: 'member',
    openTasks: 3,
    status: 'online',
    lastSeen: 'há 12 min',
    isMe: false,
  },
  {
    id: 'gr',
    name: 'Gustavo Rocha',
    email: 'gustavo@norte.studio',
    sectors: ['Desenvolvimento'],
    role: 'manager',
    openTasks: 7,
    status: 'offline',
    lastSeen: 'ontem, 18:40',
    isMe: false,
  },
  {
    id: 'ca',
    name: 'Camila Alves',
    email: 'camila@norte.studio',
    sectors: ['Financeiro'],
    role: 'member',
    openTasks: 2,
    status: 'online',
    lastSeen: 'há 30 min',
    isMe: false,
  },
  {
    id: 'jf',
    name: 'João Freitas',
    email: 'joao.freitas@cliente.com',
    sectors: ['Marketing'],
    role: 'guest',
    openTasks: 0,
    status: 'invited',
    lastSeen: 'convite enviado',
    isMe: false,
  },
]

export const SECTORS: Sector[] = [
  {
    id: 'marketing',
    name: 'Marketing',
    icon: 'campaign',
    color: '#f0541e',
    members: ['ms', 'rl', 'pa', 'jf'],
    openTasks: 14,
    managerId: 'ms',
    description: 'Campanhas, conteúdo e mídia paga.',
    columns: ['A fazer', 'Em andamento', 'Concluído'],
    wipLimit: 5,
    visibility: 'sector',
  },
  {
    id: 'design',
    name: 'Design',
    icon: 'palette',
    color: '#7c4dff',
    members: ['bc'],
    openTasks: 9,
    managerId: 'bc',
    description: 'Identidade visual, interfaces e materiais.',
    columns: ['A fazer', 'Em andamento', 'Revisão', 'Concluído'],
    wipLimit: 4,
    visibility: 'org',
  },
  {
    id: 'desenvolvimento',
    name: 'Desenvolvimento',
    icon: 'code',
    color: '#2563eb',
    members: ['gr'],
    openTasks: 21,
    managerId: 'gr',
    description: 'Produto, integrações e infraestrutura.',
    columns: ['A fazer', 'Em andamento', 'Code review', 'Concluído'],
    wipLimit: 6,
    visibility: 'org',
  },
]

// totais da organização de exemplo (a tabela mostra só uma página)
export const ORG_STATS = {
  members: 24,
  activeMembers: 22,
  seats: 25,
  sectors: 5,
  doneThisWeek: 47,
  late: 6,
  pendingInvites: 2,
}

// quantidade de membros por setor no design (a lista de exemplo tem só parte deles)
export const SECTOR_MEMBER_COUNT: Record<string, number> = {
  marketing: 8,
  design: 4,
  desenvolvimento: 6,
}

export function memberById(id: string) {
  return MEMBERS.find((member) => member.id === id)
}
