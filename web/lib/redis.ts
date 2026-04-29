// Pure in-memory store for local dev.
// On production server with Redis: set REDIS_URL env var.
// ioredis is only imported at runtime when REDIS_URL is present.

export const PROJECT_TTL = 3 * 24 * 60 * 60 // 3 days in seconds
export const MAX_PROJECTS_PER_SESSION = 3

// ─── In-memory implementation ─────────────────────────────────────────────────

const kv = new Map<string, { v: string; exp?: number }>()
const sets = new Map<string, Set<string>>()
const hashes = new Map<string, Map<string, string>>()

function alive(key: string) {
  const e = kv.get(key)
  if (!e) return false
  if (e.exp && Date.now() > e.exp) { kv.delete(key); return false }
  return true
}

export const redis = {
  async get(key: string) {
    return alive(key) ? kv.get(key)!.v : null
  },

  async set(key: string, value: string, ex?: 'EX', ttl?: number) {
    kv.set(key, { v: value, exp: ttl ? Date.now() + ttl * 1000 : undefined })
  },

  async del(key: string) {
    kv.delete(key); sets.delete(key); hashes.delete(key)
  },

  async expire(key: string, seconds: number) {
    const e = kv.get(key)
    if (e) e.exp = Date.now() + seconds * 1000
  },

  async sadd(key: string, ...members: string[]) {
    if (!sets.has(key)) sets.set(key, new Set())
    members.forEach(m => sets.get(key)!.add(m))
  },

  async srem(key: string, ...members: string[]) {
    const s = sets.get(key)
    if (s) members.forEach(m => s.delete(m))
  },

  async smembers(key: string): Promise<string[]> {
    return Array.from(sets.get(key) || [])
  },

  async hset(key: string, field: string, value: string) {
    if (!hashes.has(key)) hashes.set(key, new Map())
    hashes.get(key)!.set(field, value)
  },

  async hget(key: string, field: string): Promise<string | null> {
    return hashes.get(key)?.get(field) ?? null
  },

  async hkeys(key: string): Promise<string[]> {
    return Array.from(hashes.get(key)?.keys() || [])
  },

  async hgetall(key: string): Promise<Record<string, string>> {
    const m = hashes.get(key)
    return m ? Object.fromEntries(m.entries()) : {}
  },
}
