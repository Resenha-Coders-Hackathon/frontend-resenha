<script setup lang="ts">
import '../onboarding.css'

defineProps<{
  step: number
  steps: readonly string[]
  title: string
  description: string
  organizationId?: string
}>()
const columns = [
  { label: 'A fazer', icon: '/figma/onboarding-todo.svg' },
  { label: 'Em andamento', icon: '/figma/onboarding-progress.svg' },
  { label: 'Concluído', icon: '/figma/onboarding-done.svg' },
]
</script>

<template>
  <main class="onboarding" :data-step="step">
    <aside class="onboarding-brand-panel">
      <RouterLink
        to="/organizacoes"
        class="onboarding-wordmark"
        aria-label="Inceptum — organizações"
        >INCEP<span>T</span>UM</RouterLink
      >
      <div class="onboarding-story">
        <h2>
          {{
            step === 1 ? 'Vamos montar seu espaço de trabalho.' : 'Tarefa boa é tarefa com dono.'
          }}
        </h2>
        <p>
          Boards por setor, chat da equipe e um assistente de IA que transforma atas e arquivos em
          tarefas prontas.
        </p>
        <div class="onboarding-board" aria-hidden="true">
          <div v-for="column in columns" :key="column.label" class="onboarding-board-column">
            <div>
              <img :src="column.icon" alt="" width="8" height="8" /><span>{{ column.label }}</span>
            </div>
            <span class="onboarding-board-card"></span><span class="onboarding-board-card"></span>
          </div>
        </div>
      </div>
    </aside>
    <section class="onboarding-form-region" aria-labelledby="onboarding-title">
      <div class="onboarding-form-content">
        <header class="onboarding-mobile-header">
          <RouterLink to="/organizacoes" aria-label="Voltar para organizações"
            ><img src="/figma/onboarding-back.svg" width="20" height="20" alt=""
          /></RouterLink>
          <div>
            <span>Passo {{ step }} de {{ steps.length }}</span
            ><progress
              :value="step"
              :max="steps.length"
              :aria-label="`Passo ${step} de ${steps.length}`"
            ></progress>
          </div>
        </header>
        <ol class="onboarding-steps" aria-label="Etapas de configuração">
          <li
            v-for="(label, index) in steps"
            :key="label"
            :class="{ reached: index < step }"
            :aria-current="index === step - 1 ? 'step' : undefined"
          >
            <span class="onboarding-step-number"
              ><img
                v-if="index < step - 1"
                src="/figma/onboarding-check.svg"
                alt="Concluído"
                width="13"
                height="13"
              /><template v-else>{{ index + 1 }}</template></span
            ><span>{{ label }}</span>
          </li>
        </ol>
        <div class="onboarding-intro">
          <h1 id="onboarding-title">{{ title }}</h1>
          <p>{{ description }}</p>
        </div>
        <slot />
      </div>
    </section>
  </main>
</template>
