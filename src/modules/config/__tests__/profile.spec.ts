import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  AVATAR_MAX_SIZE,
  notificationSettings,
  profileName,
  profilePayload,
  validateAvatar,
} from '../utils/index.ts'

test('preserves a full name without splitting or changing internal spacing', () => {
  assert.equal(profileName('  Maria da Silva  '), 'Maria da Silva')
  assert.equal(profileName('Ana  Clara'), 'Ana  Clara')
  assert.equal(profileName('Prince'), 'Prince')
})

test('rejects blank names and enforces the API length limit', () => {
  assert.throws(() => profileName('   '), /Informe seu nome/)
  assert.equal(profileName('A'.repeat(255)).length, 255)
  assert.throws(() => profileName('A'.repeat(256)), /255 caracteres/)
})

test('accepts supported profile images up to the uploader size limit', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
    assert.doesNotThrow(() => validateAvatar({ type, size: AVATAR_MAX_SIZE }))
  }
})

test('rejects unsupported, empty and oversized profile images before upload', () => {
  assert.throws(() => validateAvatar({ type: 'image/svg+xml', size: 1024 }), /JPG, PNG ou WebP/)
  assert.throws(() => validateAvatar({ type: 'application/pdf', size: 1024 }), /JPG, PNG ou WebP/)
  assert.throws(() => validateAvatar({ type: 'image/png', size: 0 }), /vazia/)
  assert.throws(() => validateAvatar({ type: 'image/jpeg', size: AVATAR_MAX_SIZE + 1 }), /10 MB/)
})

test('profile writes include only fields accepted by the profile serializer', () => {
  assert.deepEqual(
    profilePayload({
      name: ' Maria da Silva ',
      email: 'readonly@example.invalid',
      timezone: 'Europe/Lisbon',
      language: 'en-US',
      bio: 'About me',
      avatar_url: ' https://example.org/avatar.png ',
    }),
    {
      name: 'Maria da Silva',
      bio: 'About me',
      avatar_url: 'https://example.org/avatar.png',
    },
  )
})

test('notification settings preserve false values without inventing event mappings', () => {
  assert.deepEqual(
    notificationSettings({
      theme: 'system',
      locale: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      email_product: false,
      email_weekly_digest: true,
      email_security: false,
      email_assigned: true,
      email_mentions: false,
      email_deadlines: true,
      app_comments: false,
      app_status: true,
      app_ai: false,
      push_enabled: false,
      date_format: 'long',
      week_start: 'monday',
      compact_cards: true,
      show_completed: false,
    }),
    {
      email_product: false,
      email_weekly_digest: true,
      email_security: false,
      email_assigned: true,
      email_mentions: false,
      email_deadlines: true,
      app_comments: false,
      app_status: true,
      app_ai: false,
      push_enabled: false,
    },
  )
})
