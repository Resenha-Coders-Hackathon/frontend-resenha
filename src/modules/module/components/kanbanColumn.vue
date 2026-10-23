<script setup lang="ts">
import { CardKanban } from '.'
import type { ITasks } from '@/shared/types'

defineProps<{
  title: string
  cards: string[]
}>()

const tasks: ITasks[] = [
  {
    id: 'a1b2c3d4-1111-4111-8111-111111111111',
    sector_id: 'b2c3d4e5-2222-4222-8222-222222222222',
    status_id: 'c3d4e5f6-3333-4333-8333-333333333333',
    parent_id: null,
    title: 'Conferir pedidos pendentes',
    description: 'Verificar os pedidos que aguardam confirmação de pagamento.',
    priority: 'high',
    due_date: '2026-10-22',
    completed_at: null,
    assignee_id: 'd4e5f6a7-4444-4444-8444-444444444444',
    assignee_name: 'Nicole Mello',
    position: 0,
    is_overdue: true,
    created_at: '2026-10-20T09:00:00Z',
  },
  {
    id: 'a1b2c3d4-1111-4111-8111-111111111112',
    sector_id: 'b2c3d4e5-2222-4222-8222-222222222222',
    status_id: 'c3d4e5f6-3333-4333-8333-333333333334',
    parent_id: null,
    title: 'Organizar rota de entregas',
    description: 'Definir a sequência de entregas considerando os endereços.',
    priority: 'medium',
    due_date: '2026-10-26',
    completed_at: null,
    assignee_id: 'd4e5f6a7-4444-4444-8444-444444444445',
    assignee_name: 'Thayná Becker',
    position: 1,
    is_overdue: false,
    created_at: '2026-10-21T13:30:00Z',
  },
  {
    id: 'a1b2c3d4-1111-4111-8111-111111111113',
    sector_id: 'b2c3d4e5-2222-4222-8222-222222222223',
    status_id: 'c3d4e5f6-3333-4333-8333-333333333333',
    parent_id: null,
    title: 'Atualizar cadastro de fornecedores',
    description: 'Revisar os dados de contato dos fornecedores ativos.',
    priority: 'low',
    due_date: null,
    completed_at: null,
    assignee_id: null,
    assignee_name: null,
    position: 2,
    is_overdue: false,
    created_at: '2026-10-22T10:15:00Z',
  },
  {
    id: 'a1b2c3d4-1111-4111-8111-111111111114',
    sector_id: 'b2c3d4e5-2222-4222-8222-222222222222',
    status_id: 'c3d4e5f6-3333-4333-8333-333333333335',
    parent_id: 'a1b2c3d4-1111-4111-8111-111111111111',
    title: 'Confirmar pagamentos recebidos',
    description: 'Comparar os comprovantes com os registros financeiros.',
    priority: 'high',
    due_date: '2026-10-22',
    completed_at: '2026-10-22T16:45:00Z',
    assignee_id: 'd4e5f6a7-4444-4444-8444-444444444444',
    assignee_name: 'Nicole Mello',
    position: 3,
    is_overdue: false,
    created_at: '2026-10-20T09:30:00Z',
  },
]
</script>

<template>
  <div
    class="flex max-h-[calc(100dvh-16rem)] min-w-72 flex-1 flex-col rounded-xl bg-(--surface) dark:bg-(--surface-inverse)"
  >
    <div
      class="flex min-h-0 flex-1 flex-col border-b border-(--border-default) py-3 px-4 dark:border-(--border-inverse)"
    >
      <div class="flex justify-between">
        <h3 class="flex gap-1 text-sm">
          <span class="material-symbols-outlined">history</span>
          <span class="font-semibold">{{ title }}</span>

          <span class="text-xs text-(--text-muted)">
            {{ cards.length }}
          </span>
        </h3>

        <div class="text-(--text-muted)">
          <button class="material-symbols-outlined">add</button>
          <button class="material-symbols-outlined">more_horiz</button>
        </div>
      </div>

      <ul class="grid min-h-0 flex-1 gap-3 overflow-y-auto py-3">
        <li v-for="(task, index) in tasks" :key="index">
          <CardKanban :task="task" />
        </li>
      </ul>

      <p class="shrink-0 pt-2 text-sm">
        {{ cards ? 'Existem itens atrasados' : 'Não há itens atrasados' }}
      </p>
    </div>
  </div>
</template>
