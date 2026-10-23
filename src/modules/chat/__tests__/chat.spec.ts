import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { registerHooks } from 'node:module'
import { createPinia, setActivePinia } from 'pinia'

const channel = (id: string, kind = 'direct', unread = 0) => ({
  id,
  kind,
  name: id,
  team_id: null,
  team_ids: [],
  sector_id: null,
  unread_count: unread,
  member_count: 2,
  online: null,
  last_message: null,
})
const message = (id: string, channelId: string, author = 'other', at = '2026-01-01T10:00:00Z') => ({
  id,
  channel_id: channelId,
  author_id: author,
  author_name: author,
  content: `msg ${id}`,
  reply_to_id: null,
  task: null,
  mentions: [],
  attachments: [],
  created_at: at,
  edited_at: null,
  deleted_at: null,
})

const calls: string[] = []
const api = {
  listChannels: async (_org: string) => [channel('c1'), channel('c2')] as unknown[],
  openDirect: async (_org: string, _user: string) => channel('c1') as unknown,
  listMessages: async (_id: string, _page?: number) => ({
    count: 0,
    next: null,
    previous: null,
    results: [] as unknown[],
  }),
  sendMessage: async (_id: string, _content: string) => message('new', 'c1', 'me') as unknown,
  markRead: async (_id: string) => {},
  startMeet: async (_id: string) => message('meet', 'c1', 'me') as unknown,
}
Object.assign(globalThis, { chatTestApi: api })

// Resolve only this store's service boundary; Vue and Pinia remain real.
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith('/chat/stores/chat.ts') && specifier === '../services') {
      const names = Object.keys(api)
      return {
        url: `data:text/javascript,${encodeURIComponent(names.map((n) => `export const ${n} = (...a) => globalThis.chatTestApi.${n}(...a);`).join('\n'))}`,
        shortCircuit: true,
      }
    }
    return nextResolve(specifier, context)
  },
})
const { useChatStore } = await import('../stores/chat.ts')
hooks.deregister()

beforeEach(() => {
  setActivePinia(createPinia())
  calls.length = 0
  api.listChannels = async () => [channel('c1'), channel('c2')]
  api.openDirect = async (_org, user) => {
    calls.push(`open:${user}`)
    return channel('c1')
  }
  api.listMessages = async () => ({
    count: 2,
    next: null,
    previous: null,
    // backend order: newest first
    results: [message('b', 'c1', 'other', '2026-01-01T10:01:00Z'), message('a', 'c1')],
  })
  api.sendMessage = async () => message('new', 'c1', 'me')
  api.markRead = async (id) => {
    calls.push(`read:${id}`)
  }
})

test('load opens a direct per member, lists channels and selects the first', async () => {
  const chat = useChatStore()
  await chat.load('org', ['u1', 'u2'])
  assert.deepEqual(calls.slice(0, 2).sort(), ['open:u1', 'open:u2'])
  assert.equal(chat.channels.length, 2)
  assert.equal(chat.activeId, 'c1')
  assert.deepEqual(
    chat.messages['c1']?.map((m) => m.id),
    ['a', 'b'],
  ) // oldest first
  assert.ok(calls.includes('read:c1'))
})

test('a failing openDirect does not hide the channel list', async () => {
  api.openDirect = async () => {
    throw new Error('boom')
  }
  const chat = useChatStore()
  await chat.load('org', ['u1'])
  assert.equal(chat.channels.length, 2)
  assert.equal(chat.error, 'boom')
})

test('send appends the message once even when the socket echoes it', async () => {
  const chat = useChatStore()
  await chat.load('org')
  await chat.send('  hi  ')
  await chat.handleEvent(
    { type: 'chat.message', channel_id: 'c1', message: message('new', 'c1', 'me') },
    'me',
  )
  assert.equal(chat.messages['c1']?.filter((m) => m.id === 'new').length, 1)
  assert.equal(chat.channels[0]?.last_message?.content, 'Você: msg new')
  assert.equal(chat.channels[0]?.unread_count, 0)
})

test('blank drafts are not sent', async () => {
  let sent = 0
  api.sendMessage = async () => {
    sent++
    return message('x', 'c1')
  }
  const chat = useChatStore()
  await chat.load('org')
  await chat.send('   ')
  assert.equal(sent, 0)
})

test('incoming message from someone else bumps unread on an inactive channel', async () => {
  const chat = useChatStore()
  await chat.load('org')
  await chat.handleEvent(
    { type: 'chat.message', channel_id: 'c2', message: message('z', 'c2') },
    'me',
  )
  assert.equal(chat.channels.find((c) => c.id === 'c2')?.unread_count, 1)
  assert.equal(chat.messages['c2'], undefined) // fetched on select, not duplicated
  await chat.select('c2')
  assert.equal(chat.channels.find((c) => c.id === 'c2')?.unread_count, 0)
})

test('incoming message on the active channel is appended and marked read', async () => {
  const chat = useChatStore()
  await chat.load('org')
  calls.length = 0
  await chat.handleEvent(
    { type: 'chat.message', channel_id: 'c1', message: message('n', 'c1') },
    'me',
  )
  assert.equal(chat.messages['c1']?.at(-1)?.id, 'n')
  assert.equal(chat.channels[0]?.unread_count, 0)
  assert.deepEqual(calls, ['read:c1'])
})

test('a conversation opened by someone else triggers a channel refresh', async () => {
  const chat = useChatStore()
  await chat.load('org')
  api.listChannels = async () => [channel('c1'), channel('c2'), channel('c3')]
  await chat.handleEvent(
    { type: 'chat.message', channel_id: 'c3', message: message('q', 'c3') },
    'me',
  )
  assert.equal(chat.channels.find((c) => c.id === 'c3')?.unread_count, 1)
})

test('edited and deleted events update the list', async () => {
  const chat = useChatStore()
  await chat.load('org')
  await chat.handleEvent(
    {
      type: 'chat.message_updated',
      channel_id: 'c1',
      message: { ...message('a', 'c1'), content: 'edited' },
    },
    'me',
  )
  assert.equal(chat.messages['c1']?.find((m) => m.id === 'a')?.content, 'edited')
  await chat.handleEvent(
    { type: 'chat.message_deleted', channel_id: 'c1', message: message('a', 'c1') },
    'me',
  )
  assert.equal(
    chat.messages['c1']?.some((m) => m.id === 'a'),
    false,
  )
})

test('typing from others is shown and ignored for myself', async () => {
  const chat = useChatStore()
  await chat.load('org')
  await chat.handleEvent({ type: 'chat.typing', channel_id: 'c1', user_id: 'me', name: 'Eu' }, 'me')
  assert.equal(chat.typing['c1'], undefined)
  await chat.handleEvent({ type: 'chat.typing', channel_id: 'c1', user_id: 'x', name: 'Ana' }, 'me')
  assert.equal(chat.typing['c1'], 'Ana')
  chat.reset() // clears the pending timer so the test process can exit
})

test('switching organization drops the previous conversations', async () => {
  const chat = useChatStore()
  await chat.load('org')
  api.listChannels = async () => [channel('z1')]
  api.listMessages = async () => ({ count: 0, next: null, previous: null, results: [] })
  await chat.load('other-org')
  assert.deepEqual(
    chat.channels.map((c) => c.id),
    ['z1'],
  )
  assert.equal(chat.messages['c1'], undefined)
})

test('meet posts the link message in the active channel', async () => {
  api.startMeet = async () => ({
    ...message('meet', 'c1', 'me'),
    content: 'Join the meeting: https://meet.google.com/x',
  })
  const chat = useChatStore()
  await chat.load('org')
  const result = await chat.meet()
  assert.equal(result.link, 'https://meet.google.com/x')
  assert.match(chat.messages['c1']?.at(-1)?.content ?? '', /meet\.google\.com/)
})

test('meet returns the backend error (e.g. Google not connected)', async () => {
  api.startMeet = async () => {
    throw new Error('Google não conectado')
  }
  const chat = useChatStore()
  await chat.load('org')
  assert.deepEqual(await chat.meet(), { error: 'Google não conectado' })
})
