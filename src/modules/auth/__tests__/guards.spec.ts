import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createMemoryHistory, createRouter } from 'vue-router'
import { safeRedirect } from '../utils/index.ts'

const auth = {
  user: null as { id: string } | null,
  loadUser: async (): Promise<{ id: string } | null> => null,
}
const messages: string[] = []
Object.assign(globalThis, {
  guardTestAuth: auth,
  guardTestRedirect: safeRedirect,
  guardTestMessages: messages,
})
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith('/app/router/guards.ts')) {
      const code =
        specifier === '@/modules/auth'
          ? 'export const useAuthStore = () => globalThis.guardTestAuth; export const safeRedirect = globalThis.guardTestRedirect;'
          : specifier === 'vue-sonner'
            ? 'export const toast = { error: (message) => globalThis.guardTestMessages.push(message) };'
            : undefined
      if (code)
        return { url: `data:text/javascript,${encodeURIComponent(code)}`, shortCircuit: true }
    }
    if (specifier.endsWith('.vue')) {
      return {
        url: 'data:text/javascript,export default { render: () => null }',
        shortCircuit: true,
      }
    }
    if (specifier.startsWith('@/') || specifier.startsWith('.')) {
      const base = specifier.startsWith('@/')
        ? new URL(`../../../${specifier.slice(2)}`, import.meta.url)
        : new URL(specifier, context.parentURL)
      for (const suffix of ['', '.ts', '/index.ts']) {
        const candidate = new URL(base.href + suffix)
        if (
          existsSync(fileURLToPath(candidate)) &&
          (suffix || candidate.pathname.endsWith('.ts'))
        ) {
          return { url: pathToFileURL(fileURLToPath(candidate)).href, shortCircuit: true }
        }
      }
    }
    return nextResolve(specifier, context)
  },
})
const { installAuthGuard } = await import('../../../app/router/guards.ts')
const { routes } = await import('../../../app/router/routes.ts')
// Lazy view imports need the .vue resolver during navigation as well.

function routerForTest() {
  const router = createRouter({ history: createMemoryHistory(), routes })
  installAuthGuard(router)
  return router
}

beforeEach(() => {
  auth.user = null
  auth.loadUser = async () => null
  messages.length = 0
})

test('every registered private route redirects anonymous visitors before loading a view', async () => {
  const router = routerForTest()
  const publicNames = [
    'Login',
    'Register',
    'RegisterCode',
    'ForgotPassword',
    'ResetCode',
    'ResetPassword',
    'InvitationAccept',
  ]
  const resolvedPublicNames: string[] = []
  for (const record of router.getRoutes()) {
    if (record.redirect) continue
    const params = Object.fromEntries(
      [...record.path.matchAll(/:(\w+)/g)].map((match) => [match[1], 'sample']),
    )
    const target = router.resolve(
      record.name
        ? {
            name: record.name,
            params,
            query: { test: 'keep' },
            hash: '#details',
          }
        : { path: record.path, query: { test: 'keep' }, hash: '#details' },
    )
    if (target.meta.requiresAuth === false) {
      resolvedPublicNames.push(String(record.name))
      continue
    }
    await router.push(target.fullPath)
    assert.equal(router.currentRoute.value.name, 'Login', record.path)
    assert.equal(router.currentRoute.value.query.redirect, target.fullPath, record.path)
  }
  assert.deepEqual(resolvedPublicNames.sort(), publicNames.sort())
})

test('integrated reports, teams and uploads routes remain registered and protected', async () => {
  const router = routerForTest()
  for (const path of ['/relatorios', '/equipe', '/arquivos']) {
    const target = router.resolve(path)
    assert.ok(target.matched.length)
    assert.notEqual(target.name, 'NotFound', path)
    await router.push(path)
    assert.equal(router.currentRoute.value.name, 'Login', path)
    assert.equal(router.currentRoute.value.query.redirect, path)
  }
})

test('removed board and personal task routes stay removed after integration', () => {
  const router = routerForTest()
  assert.equal(router.hasRoute('Mural'), false)
  assert.equal(router.hasRoute('MyTasks'), false)
  for (const path of ['/kanban', '/minhas-tarefas']) {
    assert.equal(router.resolve(path).name, 'NotFound')
  }
})

test('new routes are private without requiring a metadata flag', async () => {
  const router = routerForTest()
  let loaded = false
  router.addRoute({
    path: '/new-feature',
    name: 'NewFeature',
    component: async () => {
      loaded = true
      return { render: () => null }
    },
  })
  await router.push('/new-feature')
  assert.equal(router.currentRoute.value.name, 'Login')
  assert.equal(router.currentRoute.value.query.redirect, '/new-feature')
  assert.equal(loaded, false)
})

test('cached profiles cannot bypass server validation or revocation', async () => {
  const router = routerForTest()
  auth.user = { id: 'cached-user' }
  let checks = 0
  auth.loadUser = async () => {
    checks++
    return checks === 1 ? auth.user : null
  }
  await router.push('/')
  assert.equal(router.currentRoute.value.name, 'UserHome')
  await router.push('/chat')
  assert.equal(router.currentRoute.value.name, 'Login')
  assert.equal(router.currentRoute.value.query.redirect, '/chat')
  assert.ok(checks >= 2)
})

test('network failures cancel private navigation without clearing the cached account', async () => {
  const router = routerForTest()
  auth.user = { id: 'valid-user' }
  auth.loadUser = async () => auth.user
  await router.push('/')
  auth.loadUser = async () => {
    throw new Error('offline')
  }
  await router.push('/configuracoes')
  assert.equal(router.currentRoute.value.name, 'UserHome')
  assert.equal(auth.user.id, 'valid-user')
  assert.equal(messages.length, 1)
})

test('initial private navigation stays blocked when the server is unavailable', async () => {
  const router = routerForTest()
  auth.loadUser = async () => {
    throw new Error('offline')
  }
  await router.push('/pagamentos')
  assert.equal(router.currentRoute.value.matched.length, 0)
  assert.equal(messages.length, 1)
})

test('anonymous users keep access to auth pages and invitation landing', async () => {
  for (const target of [
    '/entrar',
    '/registrar',
    '/esqueci-senha',
    '/invitations/accept?token=secret',
  ]) {
    const router = routerForTest()
    await router.push(target)
    assert.equal(router.currentRoute.value.fullPath, target)
  }
})

test('authenticated users leave guest pages for a safe destination', async () => {
  const router = routerForTest()
  auth.loadUser = async () => ({ id: 'user' })
  await router.push({ name: 'Login', query: { redirect: '/pagamentos/123?from=login#pix' } })
  assert.equal(router.currentRoute.value.fullPath, '/pagamentos/123?from=login#pix')
})

test('external destinations and auth-page loops fall back to home', async () => {
  auth.loadUser = async () => ({ id: 'user' })
  for (const redirect of [
    'https://evil.example',
    '//evil.example',
    '/entrar',
    '/registrar?redirect=/entrar',
  ]) {
    const router = routerForTest()
    await router.push({ name: 'Login', query: { redirect } })
    assert.equal(router.currentRoute.value.name, 'Home')
  }
})

test('public auth stays reachable during outages and invitation queries survive login', async () => {
  const router = routerForTest()
  auth.loadUser = async () => {
    throw new Error('offline')
  }
  await router.push('/entrar?redirect=/kanban')
  assert.equal(router.currentRoute.value.name, 'Login')
  auth.loadUser = async () => ({ id: 'user' })
  await router.push({ name: 'Login', query: { redirect: '/invitations/accept?token=secret' } })
  assert.equal(router.currentRoute.value.fullPath, '/invitations/accept?token=secret')
})

// Keep hooks until Node finishes the lazy imports in these tests.
process.on('exit', () => hooks.deregister())
