<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { SubheaderComp } from '@/shared/components'
import { PaymentPage, PlanCard } from '../components'
import type { Plan } from '../types'
import { PLANS } from '../utils/plans'
import { usePaymentsStore } from '../stores'

const router = useRouter()
const store = usePaymentsStore()
const cycle = 'monthly'
const currentPlan = computed(() => (store.isSubscriber ? 'pro' : 'free'))
const plans = computed(() =>
  PLANS.filter((plan) => plan.id !== 'enterprise').map((plan) => ({
    ...plan,
    monthlyPrice: plan.id === 'pro' ? Number(store.price ?? 0) : 0,
    priceNote: plan.id === 'pro' ? 'pagamento único' : plan.priceNote,
    cta:
      plan.id === currentPlan.value
        ? 'Plano atual'
        : plan.id === 'pro'
          ? 'Ativar Pro'
          : 'Plano gratuito',
  })),
)
onMounted(async () => {
  try {
    await store.refreshAccess()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Não foi possível consultar seu plano.')
  }
})
function choose(plan: Plan) {
  if (plan.id === 'free' || store.isSubscriber) return
  if (!store.price) {
    toast.error('Aguarde a consulta do valor do plano.')
    return
  }
  router.push({ name: 'Payment', query: { plano: 'pro' } })
}
</script>

<template>
  <PaymentPage :crumbs="['Conta', 'Planos']">
    <SubheaderComp
      title="Planos"
      description="Use o Kanban grátis e ative o Pro para liberar recursos de IA."
      class="mb-0!"
    />

    <div class="mx-auto grid w-full max-w-[900px] items-stretch gap-[14px] md:grid-cols-2">
      <PlanCard
        v-for="plan in plans"
        :key="plan.id"
        :plan="plan"
        :cycle="cycle"
        :current="plan.id === currentPlan"
        @select="choose(plan)"
      />
    </div>

    <p class="mx-auto w-full max-w-[900px] text-[12px] leading-normal text-(--text-muted)">
      Acesso individual à IA após a confirmação do pagamento. Sem renovação automática.
    </p>
  </PaymentPage>
</template>
