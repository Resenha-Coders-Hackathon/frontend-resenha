# Implementação de assinatura Premium recorrente com Mercado Pago — Django REST Framework

## Objetivo

Implemente no backend Django REST Framework existente um sistema de assinatura Premium mensal, com cobrança automática pelo Mercado Pago.

O acesso às funcionalidades de inteligência artificial integradas ao Gemini deverá ser exclusivo de usuários com assinatura Premium vigente.

A aplicação já possui autenticação e integração com o Gemini. Preserve essas funcionalidades e reutilize a arquitetura existente.

## 1. Análise inicial do projeto

Antes de implementar:

- Inspecione a organização atual do backend, suas Models, Views, Serializers e Services.
- Identifique a Model de usuário e como são gerenciadas autenticação e permissões.
- Verifique se já existe alguma integração com o Mercado Pago, reutilizando-a quando possível.
- Identifique os endpoints e Services responsáveis pelo chatbot e pela análise de imagens e documentos.
- Siga os padrões arquiteturais e as convenções existentes, evitando duplicações e refatorações desnecessárias.

## 2. Assinatura Premium

Implemente um plano Premium com cobrança mensal automática pelo Mercado Pago.

- Utilize os recursos oficiais de assinaturas recorrentes do Mercado Pago.
- Associe cada assinatura ao usuário autenticado.
- Registre o identificador externo, status e período de vigência da assinatura.
- Mantenha o histórico das cobranças e seus respectivos estados.
- Adicione uma flag booleana que identifique se o usuário possui acesso Premium, respeitando a estrutura atual da aplicação.
- Garanta que essa flag represente corretamente o direito de acesso e não seja a única fonte de verificação da assinatura.

O usuário somente deverá receber acesso Premium após a confirmação de um pagamento válido.

## 3. Integração com Mercado Pago

Implemente o fluxo necessário para:

1. Criar uma assinatura vinculada ao usuário.
2. Retornar os dados necessários para que o frontend conclua a contratação.
3. Receber notificações do Mercado Pago por webhook.
4. Verificar a autenticidade das notificações.
5. Consultar e validar o estado real das assinaturas e cobranças na API do Mercado Pago.
6. Atualizar a assinatura e o acesso Premium conforme os pagamentos confirmados.
7. Processar renovações, falhas de cobrança, cancelamentos e vencimentos.

Utilize a documentação oficial do Mercado Pago como referência para os endpoints, eventos e parâmetros da modalidade de assinatura escolhida.

Não considere o redirecionamento do usuário após o pagamento como confirmação de aprovação.

## 4. Regras de acesso Premium

Implemente as seguintes regras:

- Usuários gratuitos não podem utilizar os recursos de IA.
- Assinaturas pendentes não concedem acesso Premium.
- A primeira cobrança aprovada ativa o Premium.
- Cada renovação confirmada estende a vigência.
- Falhas de cobrança não concedem novos períodos de acesso.
- Cancelamentos devem impedir futuras renovações, preservando o período já pago quando aplicável.
- Assinaturas vencidas devem perder o acesso Premium.
- Notificações duplicadas não devem provocar ativações ou renovações duplicadas.

Centralize a verificação da assinatura vigente em uma responsabilidade reutilizável do backend.

## 5. Integração com Gemini

Restrinja as funcionalidades de IA existentes aos usuários com Premium vigente, incluindo:

- Chatbot integrado com Gemini.
- Function Calling para gerenciamento de Tasks.
- Análise de imagens e documentos por IA.

A verificação deve acontecer no Django, antes de qualquer chamada à API do Gemini.

Preserve o comportamento atual dessas funcionalidades para usuários autorizados.

Não reimplemente a integração com Gemini nem altere desnecessariamente suas regras de negócio.

## 6. Endpoints REST

Implemente ou adapte endpoints que permitam:

- Iniciar a contratação do Premium.
- Consultar o status da assinatura do usuário autenticado.
- Consultar a vigência e a situação atual do acesso Premium.
- Solicitar o cancelamento da renovação automática.
- Receber notificações de assinaturas e cobranças do Mercado Pago.

Siga os padrões de rotas, autenticação, permissões e respostas HTTP já utilizados no projeto.

Os endpoints de gerenciamento de assinatura devem operar exclusivamente sobre os dados do usuário autenticado.

O webhook deve possuir validação própria de autenticidade, sem depender da autenticação JWT do usuário.

## 7. Segurança e consistência

- Não confie em informações de pagamento enviadas pelo frontend.
- Não exponha credenciais do Mercado Pago ou Gemini.
- Não permita que usuários alterem diretamente seu status Premium.
- Valide o vínculo entre pagamentos, assinaturas e usuários.
- Garanta processamento idempotente das notificações.
- Considere que webhooks podem chegar duplicados, atrasados ou fora de ordem.
- Evite inconsistências entre a flag Premium, o status da assinatura e sua vigência.
- Garanta que o acesso seja bloqueado após o vencimento, mesmo que algum webhook não seja recebido.
- Preserve os registros financeiros necessários para auditoria e reconciliação.

## 8. Testes e entrega

Implemente testes para:

- Contratação de assinatura.
- Ativação após pagamento confirmado.
- Rejeição de pagamentos pendentes ou inválidos.
- Renovação mensal.
- Falha de cobrança.
- Cancelamento e vencimento.
- Notificações duplicadas.
- Tentativas de acesso à IA por usuários gratuitos.
- Acesso normal à IA por usuários Premium.
- Preservação das funcionalidades existentes.

Utilize mocks para evitar cobranças reais e chamadas externas nos testes automatizados.

Ao finalizar, informe os arquivos criados ou modificados, as configurações e variáveis de ambiente necessárias, os endpoints disponíveis e como testar o fluxo utilizando o ambiente de testes do Mercado Pago.

**Restrições finais:**

- Não reimplementar o chatbot ou as funcionalidades de IA.
- Não introduzir novas camadas arquiteturais desnecessárias.
- Não modificar Models existentes além do necessário.
- Não implementar cobranças avulsas como substitutas da assinatura recorrente.
- Priorizar a reutilização do código e dos padrões existentes.

Antes de implementar, analise o projeto e utilize seu contexto para definir os detalhes técnicos mais adequados.