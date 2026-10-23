<script setup lang="ts">
import { computed, onMounted } from 'vue'

type AsideSide = 'left' | 'right'

const props = withDefaults(defineProps<{ side?: AsideSide }>(), { side: 'right' })

// cada imagem tem a parte iluminada virada para o formulário
const IMAGES: Record<AsideSide, string> = {
  left: `${import.meta.env.BASE_URL}aside-esquerda.png`,
  right: `${import.meta.env.BASE_URL}aside-direita.png`,
}

const image = computed(() => IMAGES[props.side])

// kanban ilustrativo, só decoração
const BOARD = [
  {
    title: 'A fazer',
    dot: 'bg-white/40',
    cards: [
      { title: 'Revisar ata da reunião', tag: 'Comercial', owner: 'AL' },
      { title: 'Orçamento do cliente', tag: 'Financeiro', owner: 'JP' },
    ],
  },
  {
    title: 'Fazendo',
    dot: 'bg-white/70',
    cards: [{ title: 'Layout da landing', tag: 'Design', owner: 'MR' }],
  },
  {
    title: 'Concluído',
    dot: 'bg-white',
    cards: [{ title: 'Deploy da API', tag: 'Dev', owner: 'PA' }],
  },
]

// pré-carrega a imagem do outro lado para a troca login <-> registro não piscar
onMounted(() => {
  new Image().src = IMAGES[props.side === 'left' ? 'right' : 'left']
})
</script>

<template>
    <aside
      class="auth-aside sticky top-0 hidden min-h-dvh flex-col  overflow-hidden bg-(--background-inverse) p-6 text-(--text-inverse) xl:p-9 lg:flex" 
    >
    <img
      :src="image"
      alt=""
      aria-hidden="true"
      :class="[
        'absolute inset-0 size-full object-cover',
        props.side === 'left' ? 'object-right' : 'object-left',
      ]"
    />
    <h3 class="relative font-bold text-2xl">
        Resenha<span class="shrink-0 whitespace-nowrap text-(--text-muted)">Coders</span>
    </h3>
      <figure class="relative flex-1 flex flex-col justify-end gap-4   "> 
        <blockquote class="text-4xl font-semibold tracking-[-0.01em]">
          Do pedido à entrega, cada tarefa no lugar certo.
        </blockquote>
        <p class="text-11 text-(--text-inverse-muted)">
          Boards por setor, chat da equipe e um assistente de IA que transforma atas e arquivos em tarefas prontas.
        </p>

        <div
          class="mt-2 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-md"
          aria-hidden="true"
        >
          <div v-for="column in BOARD" :key="column.title" class="flex flex-col gap-1.5">
            <div class="flex items-center gap-1.5 px-1 pt-0.5 text-[11px] leading-4 font-medium text-white/70">
              <span :class="['size-1.5 rounded-full', column.dot]"></span>
              {{ column.title }}
              <span class="ml-auto text-white/40">{{ column.cards.length }}</span>
            </div>
            <div
              v-for="card in column.cards"
              :key="card.title"
              class="rounded-lg border border-white/10 bg-black/40 p-2"
            >
              <p class="truncate text-[11px] leading-4 font-medium text-white/90">{{ card.title }}</p>
              <div class="mt-1.5 flex items-center justify-between">
                <span class="rounded-sm bg-white/10 px-1 text-[9px] leading-3.5 text-white/60">
                  {{ card.tag }}
                </span>
                <span class="grid size-4 place-items-center rounded-full bg-white/15 text-[8px] leading-none font-semibold text-white/80">
                  {{ card.owner }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </figure>
    </aside>
</template>
