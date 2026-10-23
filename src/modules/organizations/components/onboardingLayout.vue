<script setup lang="ts">
import { AuthAside, AuthSplitLayout } from '@/modules/auth'
import '../onboarding.css'

defineProps<{
  step: number
  steps: readonly string[]
  title: string
  description: string
}>()
</script>

<template>
  <main
    class="onboarding grid min-h-dvh bg-(--auth-background) dark:bg-(--background-inverse) lg:grid-cols-[36vw_minmax(0,1fr)]"
    :data-step="step"
  >
    <AuthAside side="left" />
    <AuthSplitLayout>
      <section class="onboarding-form-content" aria-labelledby="onboarding-title">
        <RouterLink to="/organizacoes" class="auth-link text-sm w-fit">
          Voltar para organizações
        </RouterLink>
        <ol class="onboarding-steps" aria-label="Etapas de configuração">
          <li
            v-for="(label, index) in steps"
            :key="label"
            :class="{ reached: index < step }"
            :aria-current="index === step - 1 ? 'step' : undefined"
          >
            <span class="onboarding-step-number">
              <span v-if="index < step - 1" aria-label="Concluído">✓</span>
              <template v-else>{{ index + 1 }}</template>
            </span>
            <span>{{ label }}</span>
          </li>
        </ol>
        <header class="onboarding-intro">
          <h1 id="onboarding-title" class="text-[38px]! leading-11.5! tracking-[-0.03em]!">
            {{ title }}
          </h1>
          <p class="mt-2 text-[16px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
            {{ description }}
          </p>
        </header>
        <slot />
      </section>
    </AuthSplitLayout>
  </main>
</template>
