<script setup lang="ts">
import { computed } from 'vue'
import type { BillingCycle, Plan, PlanFeature } from '../types'
import { formatCurrency } from '../utils'
import { planPrice } from '../utils/plans'

const props = defineProps<{ plan: Plan; cycle: BillingCycle; current: boolean }>()

defineEmits<{ select: [] }>()

const price = computed(() => planPrice(props.plan, props.cycle))
// "R$ 29" sem centavos quando o valor é inteiro
const priceLabel = computed(() =>
  formatCurrency(price.value).replace(/,00$/, '').replace(/\s/, ' '),
)

const FEATURE_ICONS: Record<PlanFeature['icon'], { icon: string; class: string }> = {
  check: { icon: 'check', class: 'text-[#1e9e5a]' },
  ai: { icon: 'check', class: 'text-(--bg-orange)' },
  shield: { icon: 'verified_user', class: 'text-[#1e9e5a]' },
  locked: { icon: 'lock', class: 'text-(--text-muted)' },
}
</script>

<template>
  <article
    :class="[
      'relative flex h-full flex-col gap-[16px] overflow-hidden rounded-[14px] border bg-(--surface) px-5 py-4 before:absolute before:top-0 before:left-5 before:h-[2px] before:w-8 before:rounded-full before:bg-(--bg-orange)/55 dark:bg-(--surface-inverse)',
      plan.highlighted
        ? 'border-(--bg-orange)/45 dark:border-(--bg-orange)/45'
        : 'border-(--border-default) dark:border-(--border-inverse)',
    ]"
  >
    <span
      v-if="plan.highlighted"
      class="absolute top-4 right-4 rounded-full bg-(--bg-orange)/10 px-2 py-0.5 text-[11px] leading-normal font-medium text-(--bg-orange) dark:bg-(--bg-orange)/15"
    >
      Recomendado
    </span>

    <header class="flex flex-col gap-[2px] leading-normal">
      <h2
        :class="[
          'text-[18px]! leading-normal! font-semibold! tracking-normal!',
          plan.highlighted ? 'text-(--bg-orange)' : '',
        ]"
      >
        {{ plan.name }}
      </h2>
      <p class="text-[13px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
        {{ plan.description }}
      </p>
    </header>

    <p class="flex flex-wrap items-baseline gap-x-[8px] gap-y-[2px]">
      <span
        :class="[
          'text-[38px] leading-none font-semibold tracking-[-0.04em]',
          plan.highlighted ? 'text-(--bg-orange)' : '',
        ]"
        >{{ priceLabel }}</span
      >
      <span class="text-[13px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
        {{ plan.priceNote }}
      </span>
    </p>
    <p
      v-if="cycle === 'yearly' && plan.monthlyPrice"
      class="-mt-[12px] text-[12px] leading-normal text-(--text-muted)"
    >
      cobrado anualmente
    </p>

    <button
      type="button"
      :disabled="current || plan.id === 'free'"
      :class="[
        'no-site-hover flex h-[42px] w-full cursor-pointer items-center justify-center gap-[6px] rounded-[10px] text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--bg-orange) disabled:cursor-default disabled:opacity-60',
        plan.highlighted
          ? 'bg-(--bg-orange) text-white hover:bg-[#e85d00]'
          : current || plan.id === 'free'
            ? 'border border-(--border-default) bg-(--bg-subtle) text-(--text-secondary) dark:border-(--border-inverse) dark:bg-white/5 dark:text-(--text-inverse-muted)'
            : 'bg-(--bg-orange) text-white',
      ]"
      @click="$emit('select')"
    >
      {{ plan.cta }}
    </button>

    <ul
      class="flex flex-col gap-[10px] border-t border-(--border-default) pt-[14px] dark:border-(--border-inverse)"
    >
      <li
        v-for="feature in plan.features"
        :key="feature.label"
        :class="[
          'flex items-start gap-[10px] text-[13px] leading-[19px]',
          feature.icon === 'locked' ? 'text-(--text-muted)' : '',
        ]"
      >
        <span
          :class="[
            'material-symbols-outlined mt-px text-[17px]!',
            FEATURE_ICONS[feature.icon].class,
          ]"
          aria-hidden="true"
          >{{ FEATURE_ICONS[feature.icon].icon }}</span
        >
        <span>
          <span v-if="feature.icon === 'locked'" class="sr-only">Não incluso: </span
          >{{ feature.label }}
        </span>
      </li>
    </ul>
  </article>
</template>
