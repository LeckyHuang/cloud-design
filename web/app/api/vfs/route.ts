// GET /api/vfs?sessionId=&projectId=&path=output.html  → get file content
// GET /api/vfs?sessionId=&projectId=  → list all files

import { vfsGet, vfsGetAll } from '@/lib/vfs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  const projectId = searchParams.get('projectId')
  const filePath = searchParams.get('path')

  if (!sessionId || !projectId) {
    return Response.json({ error: 'sessionId and projectId required' }, { status: 400 })
  }

  if (filePath) {
    const content = await vfsGet(sessionId, projectId, filePath)
    if (content === null) return Response.json({ error: 'File not found' }, { status: 404 })
    return Response.json({ path: filePath, content })
  }

  const files = await vfsGetAll(sessionId, projectId)
  return Response.json({ files })
}
