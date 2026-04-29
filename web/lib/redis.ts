// Uses Upstash Redis when env vars are present, falls back to in-memory for local dev.

import { Redis } from '@upstash/redis'

export const PROJECT_TTL = 3 * 24 * 60 * 60 // 3 days in seconds
export const MAX_PROJECTS_PER_SESSION = 3

// ─── Upstash implementation ────────────────────────────────────────────────────

const useUpstash = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
)

const upstash = useUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// ─── In-memory fallback ────────────────────────────────────────────────────────

const kv = new Map<string, { v: string; exp?: number }>()
const sets = new Map<string, Set<string>>()
const hashes = new Map<string, Map<string, string>>()

function alive(key: string) {
  const e = kv.get(key)
  if (!e) return false
  if (e.exp && Date.now() > e.exp) { kv.delete(key); return false }
  return true
}

// ─── Unified interface ─────────────────────────────────────────────────────────

export const redis = {
  async get(key: string): Promise<string | null> {
    if (upstash) return upstash.get<string>(key)
    return alive(key) ? kv.get(key)!.v : null
  },

  async set(key: string, value: string, ex?: 'EX', ttl?: number) {
    if (upstash) {
      if (ttl) await upstash.set(key, value, { ex: ttl })
      else await upstash.set(key, value)
      return
    }
    kv.set(key, { v: value, exp: ttl ? Date.now() + ttl * 1000 : undefined })
  },

  async del(key: string) {
    if (upstash) { await upstash.del(key); return }
    kv.delete(key); sets.delete(key); hashes.delete(key)
  },

  async expire(key: string, seconds: number) {
    if (upstash) { await upstash.expire(key, seconds); return }
    const e = kv.get(key)
    if (e) e.exp = Date.now() + seconds * 1000
  },

  async sadd(key: string, ...members: string[]) {
    if (upstash) { await upstash.sadd(key, members[0], ...members.slice(1)); return }
    if (!sets.has(key)) sets.set(key, new Set())
    members.forEach(m => sets.get(key)!.add(m))
  },

  async srem(key: string, ...members: string[]) {
    if (upstash) { await upstash.srem(key, members[0], ...members.slice(1)); return }
    const s = sets.get(key)
    if (s) members.forEach(m => s.delete(m))
  },

  async smembers(key: string): Promise<string[]> {
    if (upstash) return (await upstash.smembers(key)) as string[]
    return Array.from(sets.get(key) || [])
  },

  async hset(key: string, field: string, value: string) {
    if (upstash) { await upstash.hset(key, { [field]: value }); return }
    if (!hashes.has(key)) hashes.set(key, new Map())
    hashes.get(key)!.set(field, value)
  },

  async hget(key: string, field: string): Promise<string | null> {
    if (upstash) return upstash.hget<string>(key, field)
    return hashes.get(key)?.get(field) ?? null
  },

  async hkeys(key: string): Promise<string[]> {
    if (upstash) return upstash.hkeys(key)
    return Array.from(hashes.get(key)?.keys() || [])
  },

  async hgetall(key: string): Promise<Record<string, string>> {
    if (upstash) return (await upstash.hgetall(key) ?? {}) as Record<string, string>
    const m = hashes.get(key)
    return m ? Object.fromEntries(m.entries()) : {}
  },
}
