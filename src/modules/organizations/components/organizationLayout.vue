<script setup lang="ts">
import { watch } from 'vue'
import DefaultLayout from '@/app/layouts/DefaultLayout.vue'
import { useOrganizationsStore } from '../stores'
import '../organizations.css'

const props = defineProps<{ title: string; organizationId?: string }>()
const organizations = useOrganizationsStore()

// abrir/trocar a organização aqui a torna a selecionada (chat, times...)
watch(
  () => props.organizationId,
  (id) => id && organizations.select(id),
  { immediate: true },
)
</script>

<template>
  <div class="workspace">
    <DefaultLayout>
      <h1 class="sr-only">{{ title }}</h1>
      <div class="workspace-content"><slot /></div>
    </DefaultLayout>
  </div>
</template>
