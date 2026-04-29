import { redis, PROJECT_TTL, MAX_PROJECTS_PER_SESSION } from '@/lib/redis'
import { nanoid } from 'nanoid'
import type { Project } from '@/types'

// GET /api/session?sessionId=xxx  → list projects
// POST /api/session               → create project
// DELETE /api/session?projectId=xxx&sessionId=xxx → delete project

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  if (!sessionId) return Response.json({ error: 'sessionId required' }, { status: 400 })

  const key = `session:${sessionId}:projects`
  const projectIds = await redis.smembers(key)

  const projects: Project[] = []
  for (const pid of projectIds) {
    const raw = await redis.get(`project:${pid}`)
    if (raw) {
      const p = JSON.parse(raw) as Project
      // Check expiry
      if (p.expiresAt > Date.now()) {
        projects.push(p)
      } else {
        await redis.srem(key, pid)
      }
    } else {
      await redis.srem(key, pid)
    }
  }

  projects.sort((a, b) => b.updatedAt - a.updatedAt)
  return Response.json({ projects })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { sessionId, name } = body as { sessionId: string; name?: string }
  if (!sessionId) return Response.json({ error: 'sessionId required' }, { status: 400 })

  const sessionKey = `session:${sessionId}:projects`
  const projectIds = await redis.smembers(sessionKey)

  // Clean expired
  let activeCount = 0
  for (const pid of projectIds) {
    const raw = await redis.get(`project:${pid}`)
    if (raw) {
      const p = JSON.parse(raw) as Project
      if (p.expiresAt > Date.now()) activeCount++
      else await redis.srem(sessionKey, pid)
    } else {
      await redis.srem(sessionKey, pid)
    }
  }

  if (activeCount >= MAX_PROJECTS_PER_SESSION) {
    return Response.json({ error: `最多保存 ${MAX_PROJECTS_PER_SESSION} 个项目` }, { status: 429 })
  }

  const projectId = nanoid(12)
  const now = Date.now()
  const project: Project = {
    id: projectId,
    sessionId,
    name: name || `设计项目 ${new Date().toLocaleDateString('zh-CN')}`,
    createdAt: now,
    updatedAt: now,
    expiresAt: now + PROJECT_TTL * 1000,
    messages: [],
    vfs: {},
  }

  await redis.set(`project:${projectId}`, JSON.stringify(project), 'EX', PROJECT_TTL)
  await redis.sadd(sessionKey, projectId)
  await redis.expire(sessionKey, PROJECT_TTL)

  return Response.json({ project })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  const { projectId, sessionId, updates } = body as {
    projectId: string
    sessionId: string
    updates: Partial<Project>
  }

  const raw = await redis.get(`project:${projectId}`)
  if (!raw) return Response.json({ error: 'Project not found' }, { status: 404 })

  const project = JSON.parse(raw) as Project
  if (project.sessionId !== sessionId) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const updated = { ...project, ...updates, updatedAt: Date.now() }
  await redis.set(`project:${projectId}`, JSON.stringify(updated), 'EX', PROJECT_TTL)

  return Response.json({ project: updated })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const sessionId = searchParams.get('sessionId')
  if (!projectId || !sessionId) return Response.json({ error: 'Missing params' }, { status: 400 })

  const raw = await redis.get(`project:${projectId}`)
  if (raw) {
    const project = JSON.parse(raw) as Project
    if (project.sessionId !== sessionId) return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await redis.del(`project:${projectId}`)
  await redis.srem(`session:${sessionId}:projects`, projectId)

  return Response.json({ success: true })
}
