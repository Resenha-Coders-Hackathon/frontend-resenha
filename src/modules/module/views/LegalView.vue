<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ doc: 'privacidade' | 'termos' }>()

// TODO: trocar pelo e-mail de contato real antes de enviar o app para verificação do Google
const CONTACT = 'contato@michalski.app'
const UPDATED = '24 de outubro de 2026'

const docs = {
  privacidade: {
    title: 'Política de Privacidade',
    sections: [
      ['Quem somos', 'O Resenha é uma plataforma de organização de tarefas, equipes e calendário, acessível em michalski.app.'],
      ['Dados que coletamos', 'Nome, e-mail e senha (armazenada com hash) informados no cadastro; dados que você cria no app (organizações, equipes, tarefas, mensagens e anexos); e registros técnicos de acesso necessários à segurança.'],
      ['Integração com o Google', 'Se você conectar sua conta Google, solicitamos acesso ao Google Agenda (calendar.events) para criar e atualizar eventos ligados às suas tarefas e, opcionalmente, ao Google Drive (drive.file), que permite ver apenas os arquivos criados ou anexados pelo próprio Resenha. Usamos esses dados somente para fornecer essas funções.'],
      ['Uso dos dados do Google', 'O uso e a transferência de informações recebidas das APIs do Google seguem a Política de Dados do Usuário dos Serviços de API do Google, incluindo os requisitos de Uso Limitado. Não vendemos esses dados, não os usamos para publicidade e não os compartilhamos com terceiros, salvo para operar o serviço ou por obrigação legal.'],
      ['Compartilhamento', 'Os dados das organizações e equipes ficam visíveis apenas aos membros convidados. Usamos provedores de infraestrutura e de e-mail apenas para operar o serviço.'],
      ['Retenção e exclusão', 'Mantemos seus dados enquanto sua conta existir. Você pode desconectar o Google a qualquer momento no app ou em myaccount.google.com/permissions, e pedir a exclusão da conta e dos dados escrevendo para o contato abaixo.'],
      ['Seus direitos (LGPD)', 'Você pode solicitar acesso, correção, portabilidade e exclusão dos seus dados pessoais, e revogar consentimentos, a qualquer momento.'],
      ['Contato', CONTACT],
    ],
  },
  termos: {
    title: 'Termos de Serviço',
    sections: [
      ['Aceite', 'Ao criar uma conta ou usar o Resenha, você concorda com estes termos. Se não concordar, não utilize o serviço.'],
      ['O serviço', 'O Resenha oferece ferramentas de gestão de tarefas, equipes, chat e calendário, incluindo integração opcional com o Google Agenda e o Google Drive.'],
      ['Sua conta', 'Você é responsável pelas informações fornecidas, pela guarda da sua senha e pela atividade realizada na sua conta.'],
      ['Uso aceitável', 'É proibido usar o serviço para fins ilícitos, enviar conteúdo malicioso ou ofensivo, tentar acessar dados de terceiros sem autorização ou prejudicar o funcionamento da plataforma.'],
      ['Conteúdo', 'O conteúdo que você cria continua sendo seu. Você nos autoriza a armazená-lo e processá-lo apenas para prestar o serviço.'],
      ['Disponibilidade e responsabilidade', 'O serviço é oferecido "como está", sem garantia de funcionamento ininterrupto. Na extensão permitida em lei, não nos responsabilizamos por perdas indiretas decorrentes do uso.'],
      ['Encerramento', 'Você pode encerrar sua conta quando quiser. Podemos suspender contas que violem estes termos.'],
      ['Alterações', 'Podemos atualizar estes termos; o uso continuado após a mudança indica concordância.'],
      ['Privacidade e contato', `O tratamento de dados está descrito na Política de Privacidade. Dúvidas: ${CONTACT}`],
    ],
  },
} as const

const current = computed(() => docs[props.doc])
</script>

<template>
  <main class="mx-auto min-h-dvh w-full max-w-3xl px-4 py-12 sm:px-6">
    <h1 class="text-3xl font-bold">{{ current.title }}</h1>
    <p class="mt-2 text-sm text-(--text-muted)">Última atualização: {{ UPDATED }}</p>

    <section v-for="[heading, text] in current.sections" :key="heading" class="mt-8">
      <h2 class="text-xl font-semibold">{{ heading }}</h2>
      <p class="mt-2 leading-relaxed text-(--text-muted)">{{ text }}</p>
    </section>
  </main>
</template>
