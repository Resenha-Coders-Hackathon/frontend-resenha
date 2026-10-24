<script setup lang="ts">
import { computed, onMounted } from 'vue'

type AsideSide = 'left' | 'right'

const props = withDefaults(defineProps<{ side?: AsideSide }>(), { side: 'right' })

const IMAGES: Record<AsideSide, string> = {
  left: `${import.meta.env.BASE_URL}aside-esquerda.png`,
  right: `${import.meta.env.BASE_URL}aside-direita.png`,
}

const image = computed(() => IMAGES[props.side])

const BOARD = [
  {
    title: 'A fazer',
    dot: 'bg-white/40',
    accent: false,
    cards: [
      { title: 'Revisar ata da reunião', tag: 'Comercial', owner: 'AL' },
      { title: 'Orçamento do cliente', tag: 'Financeiro', owner: 'JP' },
    ],
  },
  {
    title: 'Fazendo',
    dot: 'bg-(--accent-orange)',
    accent: true,
    cards: [{ title: 'Layout da landing', tag: 'Design', owner: 'MR' }],
  },
  {
    title: 'Concluído',
    dot: 'bg-white',
    accent: false,
    cards: [{ title: 'Deploy da API', tag: 'Dev', owner: 'PA' }],
  },
]

onMounted(() => {
  new Image().src = IMAGES[props.side === 'left' ? 'right' : 'left']
})
</script>

<template>
  <aside
    class="auth-aside sticky top-0 isolate hidden min-h-dvh flex-col overflow-hidden bg-black p-6 text-white lg:flex xl:p-9"
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
    <div
      class="pointer-events-none absolute inset-0 bg-linear-to-b from-black/35 via-black/50 to-black/85"
      aria-hidden="true"
    ></div>

    <div
      :class="[
        'pointer-events-none absolute top-0 z-10 h-[2px] w-16 bg-(--accent-orange)',
        props.side === 'left' ? 'left-0' : 'right-0',
      ]"
      aria-hidden="true"
    ></div>

    <h3 class="relative z-10 font-bold text-2xl">
      <img src="/wordmark-inverse.svg" alt="ResenhaCoders" class="w-52" />
    </h3>

    <figure class="relative z-10 flex flex-1 flex-col justify-end gap-4">
      <blockquote class="text-4xl font-semibold tracking-[-0.01em]">
        Do pedido à entrega,
        <span class="text-(--accent-orange)">cada tarefa</span>
        no lugar certo.
      </blockquote>
      <p class="text-[13px] leading-5 text-white/60">
        Boards por setor, chat da equipe e um assistente de IA que transforma atas e arquivos em
        tarefas prontas.
      </p>

      <div
        class="mt-2 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-md"
        aria-hidden="true"
      >
        <div v-for="column in BOARD" :key="column.title" class="flex min-w-0 flex-col gap-1.5">
          <div
            class="flex items-center gap-1.5 px-1 pt-0.5 text-[11px] leading-4 font-medium text-white/70"
          >
            <span :class="['size-1.5 shrink-0 rounded-full', column.dot]"></span>
            <span class="truncate">{{ column.title }}</span>
            <span class="ml-auto text-white/40">{{ column.cards.length }}</span>
          </div>
          <div
            v-for="card in column.cards"
            :key="card.title"
            :class="[
              'min-w-0 rounded-lg border p-2',
              column.accent
                ? 'border-(--accent-orange)/30 bg-(--accent-orange)/10'
                : 'border-white/10 bg-black/40',
            ]"
          >
            <p class="truncate text-[11px] leading-4 font-medium text-white/90">
              {{ card.title }}
            </p>
            <div class="mt-1.5 flex items-center justify-between gap-1">
              <span
                class="truncate rounded-sm bg-white/10 px-1 text-[9px] leading-3.5 text-white/60"
              >
                {{ card.tag }}
              </span>
              <span
                class="grid size-4 shrink-0 place-items-center rounded-full bg-white/15 text-[8px] leading-none font-semibold text-white/80"
              >
                {{ card.owner }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </figure>
  </aside>
</template>
