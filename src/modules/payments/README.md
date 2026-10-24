# Pagamentos e acesso à IA

Fluxo existente de cobranças únicas Pix/cartão, conforme decisão de escopo. Não cria assinatura recorrente, período mensal, teste grátis ou renovação automática. As telas existentes consultam os registros reais; não há aprovação simulada no aplicativo.

## Configuração

- Frontend: `VITE_MP_PUBLIC_KEY`, chave **pública** do Mercado Pago.
- Backend: `MP_ACCESS_TOKEN` já existente, da mesma aplicação/conta. Nunca colocar o access token em variável `VITE_*`.
- O backend define o preço em `PAYMENT_AMOUNT` e retorna `subscription_price` em `GET /api/v1/users/me/`. O formulário não aceita nem envia `amount`.
- Configure a URL pública HTTPS do backend para receber `POST /api/v1/payments/webhook/`. A implementação existente envia essa URL ao criar a cobrança. Um backend acessível apenas em localhost não recebe notificações externas.

## Contratos e autorização

- `POST /payments/`: `{ title, name, cpf }`; retorna `payment_id` e dados Pix.
- `POST /payments/card/`: `{ title, cpf, email, token, installments, payment_method_id, issuer_id? }`; retorna `payment_id`, `status`, `status_detail`.
- `GET /payments/?page=N`: histórico paginado do usuário. As telas de confirmação consultam esse histórico e o perfil. Cartão pendente permanece em consulta, sem ser enviado para a tela Pix.
- `GET /users/me/`: acrescenta `is_subscriber` e `subscription_price` ao perfil. Ambos são somente leitura. Endpoints acima usam o prefixo `/api/v1` e cookies/CSRF existentes.
- `is_subscriber` é uma propriedade calculada no usuário a partir de pagamento próprio aprovado, com identificador do provedor e valor do plano. Não exige migration nem flag persistida que precise ser sincronizada. Estorno/cancelamento revoga o acesso se não houver outro pagamento aprovado.
- `/assistente` consulta o perfil e encaminha não assinantes para `/planos`. O backend aplica `IsSubscriber` antes de executar chat, ferramentas ou análise de arquivos; alterar o estado do navegador não libera Gemini.
- Não há expiração automática neste fluxo de pagamento único. O módulo de pagamentos do backend foi preservado: seu webhook consulta o Mercado Pago para obter o status, sem confiar no status enviado pelo navegador. Não foi implementada a modalidade recorrente descrita originalmente no MD.

O SDK oficial MercadoPago.js v2 tokeniza o cartão no navegador. Número/CVV não são enviados à API da aplicação nem persistidos na store. Apenas o token e identificadores do meio de pagamento chegam ao backend. Referência: [métodos oficiais do SDK](https://github.com/mercadopago/sdk-js/blob/main/docs/core-methods.md).

## Verificação

```bash
node src/modules/payments/__tests__/integration.spec.ts
npm run type-check
npm run build
# no backend:
.venv/bin/python manage.py test core.modules.ai core.modules.payments
```

Para um teste manual, use credenciais, comprador e cartões de teste da sua aplicação Mercado Pago, nunca cartão real. Entre com usuário sem pagamento aprovado, abra `/assistente` e confira o encaminhamento para planos. Crie o pagamento, confira que `pending` não libera a IA, aguarde a confirmação real do provedor e use o botão de consulta. Após `approved`, abra o assistente. A simples visita à URL de sucesso não aprova o pagamento. Consulte o [ambiente de testes oficial](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards) para os dados aplicáveis à conta e ao meio de pagamento.

Os testes automatizados simulam Mercado Pago/Gemini, sem cobrança ou uso de cota. A liberação ponta a ponta depende de credenciais válidas e entrega do webhook no ambiente configurado.
