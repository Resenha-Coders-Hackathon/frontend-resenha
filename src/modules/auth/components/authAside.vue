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
      </figure>
    </aside>
</template>
