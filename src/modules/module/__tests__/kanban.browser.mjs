// Run against a local Vite server: node src/modules/module/__tests__/kanban.browser.mjs
// Uses an installed Chromium browser and Node's built-in CDP/WebSocket support.
// All API traffic is intercepted; no backend or account data is changed.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const profile = await mkdtemp(join(tmpdir(), 'kanban-browser-'))
const browser = spawn(
  process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { windowsHide: true, stdio: 'ignore' },
)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let socket
let sequence = 0
const pending = new Map()
const errors = []
const calls = []
const page = (results) => ({ count: results.length, next: null, previous: null, results })
const statuses = [
  { id: 'todo', name: 'A fazer', color: '#64748b', category: 'todo', position: 0, wip_limit: null },
  {
    id: 'doing',
    name: 'Em andamento',
    color: '#c9720a',
    category: 'in_progress',
    position: 1,
    wip_limit: 5,
  },
  {
    id: 'done',
    name: 'Concluído',
    color: '#15924a',
    category: 'done',
    position: 2,
    wip_limit: null,
  },
]
const task = (id, title, status_id, position = 0) => ({
  id,
  title,
  status_id,
  position,
  sector_id: 'sector',
  parent_id: null,
  description: 'Hero com vídeo, prova social e formulário de pré-cadastro integrado ao CRM.',
  priority: 'high',
  due_date: '2026-10-26',
  completed_at: status_id === 'done' ? '2026-10-22T12:00:00Z' : null,
  assignee_id: 'user',
  assignee_name: 'Beatriz Costa',
  is_overdue: false,
  created_at: '2026-10-18T12:00:00Z',
})
const tasks = [
  task('task-1', 'Roteiro do vídeo de lançamento (60s)', 'todo'),
  task('task-2', 'Landing page da campanha de lançamento', 'doing'),
  task('task-3', 'Pesquisa de concorrentes e posicionamento', 'done'),
]
const checklist = [
  { id: 'item-1', content: 'Wireframe aprovado', is_done: true, position: 0 },
  { id: 'item-2', content: 'Integração do formulário com o CRM', is_done: false, position: 1 },
]
const comments = []
let failMove = false
function send(method, params = {}) {
  const id = ++sequence
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
  if (result.exceptionDetails)
    throw new Error(
      result.exceptionDetails.text + ': ' + result.exceptionDetails.exception?.description,
    )
  return result.result.value
}
async function wait(expression) {
  for (let i = 0; i < 150; i++) {
    if (await evaluate(expression)) return
    await delay(100)
  }
  throw new Error(`Timed out: ${expression}`)
}
async function click(text, scope = 'document') {
  await evaluate(
    `(() => { const button = Array.from(${scope}.querySelectorAll('button')).find(el => el.textContent.trim().endsWith(${JSON.stringify(text)})); if (!button) throw new Error('Button missing: ' + ${JSON.stringify(text)}); button.click() })()`,
  )
}
async function input(selector, value) {
  await evaluate(
    `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) throw new Error('Input missing'); el.value = ${JSON.stringify(value)}; el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })) })()`,
  )
}
async function screenshot(name) {
  await evaluate('document.fonts.ready.then(() => true)')
  const result = await send('Page.captureScreenshot', { format: 'png' })
  await writeFile(join(profile, name), Buffer.from(result.data, 'base64'))
}
async function intercept(event) {
  const { requestId, request } = event
  const path = new URL(request.url).pathname.replace('/api/v1', '')
  const body = request.postData ? JSON.parse(request.postData) : {}
  let data
  let code = 200
  calls.push({ method: request.method, path, body })
  if (path === '/users/me/')
    data = { id: 'user', name: 'Beatriz Costa', email: 'test@example.test' }
  else if (path === '/notifications/') data = page([])
  else if (path === '/organizations/')
    data = page([{ id: 'org', name: 'Norte Studio', slug: 'norte', current_role: 'owner' }])
  else if (path === '/organizations/org/sectors/')
    data = page([
      {
        id: 'sector',
        organization_id: 'org',
        name: 'Sprint de Outubro',
        description: 'Setor de Marketing · campanha de lançamento do app',
        color: '#ff6700',
      },
    ])
  else if (path === '/sectors/sector/statuses/' && request.method === 'POST') {
    data = { id: `status-${statuses.length}`, ...body }
    statuses.push(data)
    code = 201
  } else if (path === '/sectors/sector/statuses/') data = page(statuses)
  else if (path.startsWith('/sectors/sector/statuses/') && request.method === 'PATCH') {
    data = statuses.find((status) => status.id === path.split('/')[4])
    Object.assign(data, body)
  } else if (path === '/sectors/sector/tasks/' && request.method === 'POST') {
    data = {
      ...task(`task-${tasks.length + 1}`, body.title, body.status),
      ...body,
      assignee_id: body.assignee,
      assignee_name: body.assignee ? 'Beatriz Costa' : null,
    }
    tasks.push(data)
    code = 201
  } else if (path === '/sectors/sector/tasks/') data = page(tasks)
  else if (path === '/sectors/sector/members/')
    data = page([
      { id: 1, user_id: 'user', name: 'Beatriz Costa', email: 'test@example.test', role: 'editor' },
    ])
  else if (/\/tasks\/[^/]+\/move\/$/.test(path)) {
    if (failMove) {
      code = 400
      data = { detail: 'Movimento recusado pelo teste.' }
    } else {
      data = tasks.find((task) => task.id === path.split('/')[2])
      Object.assign(data, {
        status_id: body.status,
        position: body.position ?? 0,
        completed_at:
          statuses.find((status) => status.id === body.status).category === 'done'
            ? '2026-10-23T12:00:00Z'
            : null,
      })
    }
  } else if (/\/checklist\/item/.test(path) && request.method === 'PATCH') {
    data = checklist.find((item) => item.id === path.split('/')[4])
    Object.assign(data, body)
  } else if (path.endsWith('/checklist/') && request.method === 'POST') {
    data = { id: `item-${checklist.length + 1}`, is_done: false, ...body }
    checklist.push(data)
    code = 201
  } else if (path.endsWith('/checklist/')) data = page(checklist)
  else if (path.endsWith('/comments/') && request.method === 'POST') {
    data = {
      id: `comment-${comments.length}`,
      author_id: 'user',
      author_name: 'Beatriz Costa',
      created_at: '2026-10-23T12:00:00Z',
      ...body,
    }
    comments.push(data)
    code = 201
  } else if (path.endsWith('/comments/')) data = page(comments)
  else if (/^\/tasks\/[^/]+\/$/.test(path) && request.method === 'PATCH') {
    data = tasks.find((task) => task.id === path.split('/')[2])
    Object.assign(data, body)
  } else {
    code = 404
    data = { detail: `Unexpected test request: ${path}` }
  }
  await send('Fetch.fulfillRequest', {
    requestId,
    responseCode: code,
    responseHeaders: [{ name: 'Content-Type', value: 'application/json' }],
    body: Buffer.from(JSON.stringify(data)).toString('base64'),
  })
}
try {
  let port
  for (let i = 0; i < 100; i++) {
    try {
      port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]
      break
    } catch {
      await delay(100)
    }
  }
  assert.ok(port, 'Chromium debugging port is available')
  let target
  for (let i = 0; i < 50; i++) {
    try {
      target = await (
        await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })
      ).json()
      break
    } catch {
      await delay(100)
    }
  }
  assert.ok(target, 'Chromium page target is available')
  socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }))
  socket.addEventListener('close', (event) => {
    for (const entry of pending.values())
      entry.reject(new Error(`Browser connection closed: ${event.code} ${event.reason}`))
    pending.clear()
  })
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data)
    if (message.id) {
      const entry = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) entry?.reject(new Error(message.error.message))
      else entry?.resolve(message.result)
    } else if (message.method === 'Fetch.requestPaused')
      void intercept(message.params).catch((error) => errors.push(error.message))
    else if (message.method === 'Runtime.exceptionThrown')
      errors.push(
        message.params.exceptionDetails.exception?.description ||
          message.params.exceptionDetails.text,
      )
  })
  await send('Runtime.enable')
  await send('Page.enable')
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: 'light' }],
  })
  await send('Fetch.enable', { patterns: [{ urlPattern: '*/api/v1/*' }] })
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1024,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await send('Page.navigate', { url: process.env.KANBAN_URL || 'http://127.0.0.1:5173/kanban' })
  await wait('document.querySelectorAll(".kb-card").length === 3')
  assert.equal(
    await evaluate('document.documentElement.scrollWidth <= window.innerWidth'),
    true,
    'Desktop has no page overflow',
  )
  await screenshot('desktop-light.png')
  await evaluate(
    `(() => { const card = document.querySelector('.kb-card'); const target = document.querySelectorAll('.kb-column')[1]; const data = new DataTransfer(); card.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: data })); target.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: data })); card.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: data })); })()`,
  )
  await wait('document.querySelectorAll(".kb-column")[1].querySelectorAll(".kb-card").length === 2')
  assert.ok(
    calls.some((call) => call.path === '/tasks/task-1/move/' && call.body.status === 'doing'),
    'Drag persists using move API',
  )
  await evaluate(
    'document.querySelectorAll(".kb-column")[1].querySelector(".kb-card-title").click()',
  )
  await wait(
    'document.querySelector("dialog[open]") && !document.querySelector("dialog").textContent.includes("Carregando checklist")',
  )
  await input('[aria-label="Novo status da tarefa"]', 'done')
  await click('Mudar status')
  await wait(
    'document.querySelector("dialog").textContent.includes("Concluído") && document.querySelectorAll(".kb-column")[2].querySelectorAll(".kb-card").length === 2',
  )
  await evaluate('document.querySelector("dialog input[type=checkbox]:not(:checked)").click()')
  await wait('document.querySelectorAll("dialog input[type=checkbox]:checked").length === 2')
  await input('[aria-label="Novo item do checklist"]', 'Validar publicação')
  await click('Adicionar', 'document.querySelector("dialog")')
  await wait('document.querySelectorAll("dialog input[type=checkbox]").length === 3')
  await input('[aria-label="Escrever comentário"]', 'Pronto para revisão.')
  await click('Comentar')
  await wait('document.querySelector("dialog").textContent.includes("Pronto para revisão.")')
  await screenshot('task-detail.png')
  await evaluate('document.querySelector("dialog [aria-label=Fechar]").click()')
  await click('Nova coluna')
  await wait('document.querySelector("dialog input")?.maxLength === 80')
  await input('dialog input[maxlength="80"]', 'Em revisão')
  await input('dialog input[type="color"]', '#6a4cf5')
  await click('Criar coluna')
  await wait(
    'document.querySelectorAll(".kb-column").length === 4 && !document.querySelector("dialog")',
  )
  await evaluate(
    'document.querySelectorAll(".kb-column")[3].querySelector("button[aria-label^=Personalizar]").click()',
  )
  await input('dialog input[maxlength="80"]', 'Revisão final')
  await click('Salvar coluna')
  await wait(
    'document.querySelectorAll(".kb-column")[3].textContent.includes("Revisão final") && !document.querySelector("dialog")',
  )
  await click('Nova tarefa')
  await wait('document.querySelector("dialog input")?.maxLength === 255')
  await input('dialog input[maxlength="255"]', 'Nova tarefa de integração')
  await click('Criar tarefa')
  await wait('!!document.querySelector(".kb-drawer")')
  assert.equal(tasks.length, 4, 'Task creation persists')
  await evaluate('document.querySelector("dialog [aria-label=Fechar]").click()')
  await input('[aria-label="Buscar tarefas ou pessoas"]', 'Nova tarefa de integração')
  await wait('document.querySelectorAll(".kb-card").length === 1')
  await input('[aria-label="Buscar tarefas ou pessoas"]', '')
  await wait('document.querySelectorAll(".kb-card").length === 4')
  failMove = true
  await evaluate(
    `(() => { const card = document.querySelectorAll('.kb-column')[0].querySelector('.kb-card'); const target = document.querySelectorAll('.kb-column')[1]; const data = new DataTransfer(); card.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: data })); target.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: data })); })()`,
  )
  await wait('document.querySelector(".kb-error")?.textContent.includes("Movimento recusado")')
  assert.equal(
    await evaluate(
      'document.querySelectorAll(".kb-column")[0].querySelectorAll(".kb-card").length',
    ),
    1,
    'Failed move rolls back and board stays visible',
  )
  failMove = false
  await click('Recarregar quadro')
  await wait(
    'document.querySelectorAll(".kb-card").length === 4 && !document.querySelector(".kb-error")',
  )
  assert.equal(
    await evaluate('document.querySelectorAll(".kb-column").length'),
    4,
    'Reload restores persisted columns',
  )
  await evaluate('document.documentElement.classList.add("dark")')
  await screenshot('desktop-dark.png')
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  })
  assert.equal(
    await evaluate('document.documentElement.scrollWidth <= window.innerWidth'),
    true,
    'Mobile has no page overflow',
  )
  await screenshot('mobile-dark.png')
  await evaluate('document.querySelector(".kb-card-title").click()')
  await wait('!!document.querySelector("dialog[open]")')
  assert.equal(
    await evaluate('Math.round(document.querySelector("dialog").getBoundingClientRect().width)'),
    390,
    'Mobile drawer fits viewport',
  )
  await screenshot('mobile-task.png')
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  })
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  })
  await wait('!document.querySelector("dialog[open]")')
  assert.deepEqual(errors, [], 'No browser runtime errors')
  console.log(
    'PASS: drag persistence, sidebar status, checklist, comments, column creation/customization, task creation, search, API rollback, desktop/mobile overflow, mobile drawer, dark screenshots.',
  )
  console.log(`Screenshots: ${profile}`)
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    await Promise.race([send('Browser.close').catch(() => {}), delay(2000)])
  }
  socket?.close()
  browser.kill()
}
