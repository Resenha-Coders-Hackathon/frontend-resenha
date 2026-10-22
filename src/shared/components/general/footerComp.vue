<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'

const currentYear = new Date().getFullYear()
const email = ref('')

const columns = [
  {
    title: 'Produto',
    links: ['Recursos', 'Preços', 'Integrações', 'Novidades'],
  },
  {
    title: 'Empresa',
    links: ['Sobre', 'Carreiras', 'Blog', 'Contato'],
  },
  {
    title: 'Suporte',
    links: ['Central de ajuda', 'Status', 'FAQ', 'Comunidade'],
  },
  {
    title: 'Legal',
    links: ['Termos de uso', 'Privacidade', 'Cookies', 'Licenças'],
  },
]

function subscribe() {
  if (!email.value) return
  toast.success('Inscrição feita! Fique de olho no seu e-mail.')
  email.value = ''
}
</script>

<template>
  <!-- Cores e medidas fixas em px: o footer não acompanha o tema nem o font-size do html -->
  <footer
    class="bg-[#000000] font-['Inter',sans-serif] text-[14px] leading-[21px] text-[#ffffff]"
  >
    <div
      class="mx-auto w-full max-w-[1440px] px-[20px] pt-[48px] pb-[56px] sm:px-[40px] lg:px-[80px] lg:pt-[72px] lg:pb-[72px]"
    >
      <div class="flex flex-col gap-[44px] lg:flex-row lg:justify-between lg:gap-[64px]">
        <div class="lg:max-w-[320px]">
          <RouterLink
            to="/"
            class="inline-block w-fit rounded-[4px] font-jakarta text-[18px] leading-[32px] font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffffff]"
          >
            Resenha<span class="text-[#a3a3a3]">Coders</span>
          </RouterLink>

          <p class="mt-[22px] max-w-[300px] text-[#b5b5b5]">
            Uma frase curta que resume a proposta de valor da marca.
          </p>

          <form class="mt-[20px] flex items-center gap-[9px]" @submit.prevent="subscribe">
            <label for="footer-email" class="sr-only">Seu e-mail</label>
            <input
              id="footer-email"
              v-model="email"
              type="email"
              required
              placeholder="seu@email.com"
              class="h-[45px] min-w-0 flex-1 rounded-[6px] border border-[#3a3a3a] bg-[#000000] px-[14px] text-[14px] text-[#ffffff] placeholder:text-[#8c8c8c] focus:border-[#8c8c8c] focus:outline-none lg:w-[220px] lg:flex-none"
            />
            <button
              type="submit"
              class="h-[42px] shrink-0 rounded-[6px] bg-[#ffffff] px-[18px] text-[14px] font-medium text-[#000000] transition-colors hover:bg-[#e5e5e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffffff]"
            >
              Assinar
            </button>
          </form>
        </div>

        <nav
          aria-label="Navegação do rodapé"
          class="grid grid-cols-2 gap-x-[32px] gap-y-[44px] lg:w-[704px] lg:shrink-0 lg:grid-cols-[188px_188px_188px_1fr] lg:gap-0 lg:pt-[2px]"
        >
          <div v-for="column in columns" :key="column.title">
            <p class="font-medium text-[#ffffff]">{{ column.title }}</p>
            <ul class="mt-[14px] flex flex-col gap-[14px]">
              <li v-for="link in column.links" :key="link">
                <a
                  href="#"
                  class="text-[#a3a3a3] transition-colors hover:text-[#ffffff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffffff]"
                >
                  {{ link }}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div class="mt-[40px] border-t border-[#262626] pt-[48px] lg:mt-[56px] lg:pt-[57px]">
        <p class="text-[12px] leading-[18px] text-[#b5b5b5]">
          © {{ currentYear }} ResenhaCoders. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>
