# Gemini integration

The `/assistente` view consumes this module's public barrel. HTTP stays in
`services/`, Pinia state in `stores/`, and API shapes in `types/`. All requests use
the existing shared Axios instance, including cookie authentication, CSRF and
session refresh. No Gemini credential belongs in the frontend.

- `POST /ai/ask/` receives `prompt`, `request_id`, optional `conversation_id` and
  optional `confirmation_token`. The response contains `answer`, actual `actions`,
  `conversation_id` and an optional deletion confirmation token. Each entry in
  `actions` is a receipt `{action, writes, targets, status, result}` where `status` is
  `succeeded`, `failed`, `uncertain` or `confirmation_required`. The UI shows what the
  receipts say happened, never what the model's text claims.
- `POST /ai/analyze/` receives repeated multipart `files` fields and returns a PDF
  blob. JSON error bodies returned as blobs are decoded before displaying errors.
- AI conversations are independent of human chat channels. There is no AI
  message-list or message-edit API. The sidebar lists conversations from the
  current frontend session only. Reloading the page clears client-side history;
  backend context also expires according to its configured cache lifetime.
- Task cards offer Concluir / Editar / Excluir. Concluir and Excluir send a normal
  message naming the task; Excluir only produces a `confirmation_required` receipt and
  the user must press "Confirmar exclusão" (server-enforced). Editar fills the composer.
- Task creation/update/completion results are already persisted by the backend.
  Cards display those results and never post a second "add to board" operation.
- Deletion requires the server token and a separate explicit confirmation.
  New messages replace pending confirmation according to backend behavior.
- Lost responses, 429 and server errors retain their exact request UUID/payload
  for explicit retry. Uncertain operations are never retried under a new UUID.
  Expired conversation IDs require the user to start a new conversation.
- Account changes clear client state and release PDF URLs. Late responses from
  the previous account are discarded. State and tokens are not stored in local
  storage. Backend permissions remain authoritative for every tool operation.
- File analysis is a separate report workflow. File attachments are not sent as
  task-chat messages or represented as inputs the task chatbot has read.

The existing project tests use Node's test runner and service-boundary hooks.
No additional runner or dependency is required:

```bash
node src/modules/ai/__tests__/services.spec.ts
node src/modules/ai/__tests__/utils.spec.ts
node src/modules/ai/__tests__/store.spec.ts
node src/modules/chat/__tests__/chat.spec.ts
npm run type-check
npm run build
```

Run ESLint/Oxlint without `--fix` for a repository-wide audit when other modules
contain work in progress; format or fix only files in this integration's scope.
