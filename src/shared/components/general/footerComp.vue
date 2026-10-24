<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'

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
  <footer class="bg-(--background-inverse) text-[14px] leading-5.25 text-(--text-inverse)">
    <div class="mx-auto w-full max-w-360 px-5 pt-8 pb-8 sm:px-10 lg:px-20 lg:pt-10 lg:pb-8">
      <div class="flex flex-col gap-8 lg:flex-row lg:justify-between lg:gap-16">
        <div class="lg:max-w-[320px]">
          <RouterLink
            to="/"
            class="inline-block w-fit rounded-sm text-[18px] leading-8 font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--text-inverse)"
          >
            Resenha<span class="text-(--text-muted)">Coders</span>
          </RouterLink>

          <p class="mt-5.5 max-w-75 text-(--text-muted)">
            Tarefas, equipes e conversas da sua organização em um só lugar.
          </p>

          <form class="mt-5 flex items-center gap-2.25" @submit.prevent="subscribe">
            <label for="footer-email" class="sr-only">Seu e-mail</label>
            <input
              id="footer-email"
              v-model="email"
              type="email"
              required
              placeholder="seu@email.com"
              class="h-11.25 min-w-0 flex-1 rounded-md border border-(--border-inverse) bg-(--background-inverse) px-3.5 text-[14px] text-(--text-inverse) placeholder:text-[#8c8c8c] focus:border-[#8c8c8c] focus:outline-none lg:w-55 lg:flex-none"
            />
            <button
              type="submit"
              class="h-10.5 shrink-0 rounded-md bg-[#ffffff] px-4.5 text-[14px] font-medium text-[#000000] transition-colors hover:bg-[#e5e5e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-inverse)"
            >
              Assinar
            </button>
          </form>
        </div>

        <nav
          aria-label="Navegação do rodapé"
          class="grid grid-cols-2 gap-x-8 gap-y-6 lg:w-176 lg:shrink-0 lg:grid-cols-[188px_188px_188px_1fr] lg:gap-0 lg:pt-0.5"
        >
          <div v-for="column in columns" :key="column.title">
            <p class="font-medium text-(--text-inverse)">{{ column.title }}</p>
            <ul class="mt-3 flex flex-col gap-2">
              <li v-for="link in column.links" :key="link">
                <a
                  href="#"
                  class="text-[#a3a3a3] transition-colors hover:text-(--text-inverse) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--text-inverse)"
                >
                  {{ link }}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div class="mt-6 border-t border-[#262626] pt-5 lg:mt-8 lg:pt-5">
        <p class="text-[12px] leading-4.5 text-[#b5b5b5]">
          © {{ new Date().getFullYear() }} ResenhaCoders. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>
