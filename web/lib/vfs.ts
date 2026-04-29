// Virtual filesystem operations backed by Redis per session/project
import { redis } from './redis'

export function vfsKey(sessionId: string, projectId: string): string {
  return `vfs:${sessionId}:${projectId}`
}

export async function vfsGet(sessionId: string, projectId: string, filePath: string): Promise<string | null> {
  const raw = await redis.hget(vfsKey(sessionId, projectId), filePath)
  return raw
}

export async function vfsSet(sessionId: string, projectId: string, filePath: string, content: string): Promise<void> {
  await redis.hset(vfsKey(sessionId, projectId), filePath, content)
  // Refresh TTL on every write
  await redis.expire(vfsKey(sessionId, projectId), 3 * 24 * 60 * 60)
}

export async function vfsEdit(
  sessionId: string,
  projectId: string,
  filePath: string,
  oldString: string,
  newString: string
): Promise<{ success: boolean; error?: string }> {
  const content = await vfsGet(sessionId, projectId, filePath)
  if (content === null) {
    return { success: false, error: `File not found: ${filePath}` }
  }
  if (!content.includes(oldString)) {
    return { success: false, error: `old_string not found in ${filePath}` }
  }
  const updated = content.replace(oldString, newString)
  await vfsSet(sessionId, projectId, filePath, updated)
  return { success: true }
}

export async function vfsList(sessionId: string, projectId: string): Promise<string[]> {
  const files = await redis.hkeys(vfsKey(sessionId, projectId))
  return files
}

export async function vfsGetAll(sessionId: string, projectId: string): Promise<Record<string, string>> {
  const all = await redis.hgetall(vfsKey(sessionId, projectId))
  return all || {}
}
