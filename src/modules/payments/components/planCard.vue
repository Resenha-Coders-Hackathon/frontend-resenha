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
  ai: { icon: 'auto_awesome', class: 'text-(--plan-pro)' },
  shield: { icon: 'verified_user', class: 'text-[#1e9e5a]' },
  locked: { icon: 'lock', class: 'text-(--text-muted)' },
}
</script>

<template>
  <article
    :class="[
      'relative flex flex-col gap-[18px] rounded-[16px] border bg-(--surface) p-[22px] dark:bg-(--surface-inverse)',
      plan.highlighted
        ? 'border-(--plan-pro) shadow-[0_18px_40px_-18px_rgb(107_78_255/0.45)] lg:-mt-[12px] lg:pb-[30px]'
        : 'border-(--border-default) dark:border-(--border-inverse)',
    ]"
  >
    <span
      v-if="plan.highlighted"
      class="flex w-fit items-center gap-[4px] rounded-full bg-(--plan-pro) px-[8px] py-[2px] text-[11.5px] leading-normal font-medium text-white"
    >
      <span class="material-symbols-outlined text-[13px]!" aria-hidden="true">auto_awesome</span>
      Mais escolhido
    </span>

    <header class="flex flex-col gap-[2px] leading-normal">
      <h2 class="text-[17px]! leading-normal! font-semibold! tracking-normal!">{{ plan.name }}</h2>
      <p class="text-[13px] text-(--text-secondary) dark:text-(--text-inverse-muted)">
        {{ plan.description }}
      </p>
    </header>

    <p class="flex items-baseline gap-[8px]">
      <span class="text-[38px] leading-none font-semibold tracking-[-0.03em]">{{
        priceLabel
      }}</span>
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
      :disabled="current"
      :class="[
        'flex h-[42px] w-full cursor-pointer items-center justify-center gap-[6px] rounded-[10px] text-[14px] font-medium transition-[opacity,background-color] disabled:cursor-default',
        plan.highlighted
          ? 'bg-(--plan-pro) text-white hover:opacity-90'
          : current
            ? 'border border-(--border-default) text-(--text-secondary) dark:border-(--border-inverse) dark:text-(--text-inverse-muted)'
            : 'bg-(--text-primary) text-white hover:opacity-90 dark:bg-(--text-inverse) dark:text-(--text-primary)',
      ]"
      @click="$emit('select')"
    >
      <span
        v-if="plan.highlighted"
        class="material-symbols-outlined text-[17px]!"
        aria-hidden="true"
        >auto_awesome</span
      >
      {{ plan.cta }}
    </button>

    <ul class="flex flex-col gap-[10px]">
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
