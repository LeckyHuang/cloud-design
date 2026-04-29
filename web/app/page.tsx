'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useStream } from '@/lib/useStream'
import type { FileAttachment } from '@/lib/useStream'
import TopBar from '@/components/TopBar'
import ChatPanel from '@/components/ChatPanel'
import PreviewPanel from '@/components/PreviewPanel'
import ProjectDrawer from '@/components/ProjectDrawer'
import type { Provider, Project } from '@/types'
import { MODEL_OPTIONS } from '@/lib/providers'
import { nanoid } from 'nanoid'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('cloud-design-session')
  if (!id) { id = nanoid(16); localStorage.setItem('cloud-design-session', id) }
  return id
}

export default function HomePage() {
  const [provider, setProvider] = useState<Provider>('anthropic')
  const [model, setModel] = useState(MODEL_OPTIONS.anthropic[0].id)
  const [customModel, setCustomModel] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [projectName, setProjectName] = useState('新建设计')
  const [projects, setProjects] = useState<Project[]>([])
  const [htmlOutput, setHtmlOutput] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [inputText, setInputText] = useState('')

  // Refs — always hold latest values for the stream hook callbacks
  const sessionIdRef = useRef('')
  const projectIdRef = useRef('')
  const providerRef = useRef<Provider>('anthropic')
  const modelRef = useRef(MODEL_OPTIONS.anthropic[0].id)
  const customModelRef = useRef('')
  const baseUrlRef = useRef('')
  const apiKeyRef = useRef('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])
  useEffect(() => { projectIdRef.current = projectId }, [projectId])
  useEffect(() => { providerRef.current = provider }, [provider])
  useEffect(() => { modelRef.current = model }, [model])
  useEffect(() => { customModelRef.current = customModel }, [customModel])
  useEffect(() => { baseUrlRef.current = baseUrl }, [baseUrl])
  useEffect(() => { apiKeyRef.current = apiKey }, [apiKey])

  const fetchHtmlOutput = useCallback(async () => {
    const sid = sessionIdRef.current
    const pid = projectIdRef.current
    if (!sid || !pid) return
    try {
      const res = await fetch(`/api/vfs?sessionId=${sid}&projectId=${pid}&path=output.html`)
      if (res.ok) { const d = await res.json(); setHtmlOutput(d.content) }
    } catch { /* silent */ }
  }, [])

  const { messages, streamingText, isLoading, sendMessage, stop } = useStream({
    sessionId: () => sessionIdRef.current,
    projectId: () => projectIdRef.current,
    provider: () => providerRef.current,
    apiKey: () => apiKeyRef.current,
    model: () => providerRef.current === 'custom' ? customModelRef.current : modelRef.current,
    baseUrl: () => providerRef.current === 'custom' ? baseUrlRef.current : undefined,
    onDone: fetchHtmlOutput,
  })

  // Poll VFS while generating
  useEffect(() => {
    if (isLoading) {
      if (!pollRef.current) pollRef.current = setInterval(fetchHtmlOutput, 3000)
    } else {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    }
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }
  }, [isLoading, fetchHtmlOutput])

  // Init
  useEffect(() => {
    const sid = getSessionId()
    setSessionId(sid); sessionIdRef.current = sid
    const savedKey = localStorage.getItem('cloud-design-api-key') || ''
    if (savedKey) { setApiKey(savedKey); apiKeyRef.current = savedKey }
    const savedPid = localStorage.getItem('cloud-design-project-id')
    initProject(sid, savedPid || undefined)
    loadProjects(sid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { if (apiKey) localStorage.setItem('cloud-design-api-key', apiKey) }, [apiKey])

  async function initProject(sid: string, savedPid?: string) {
    if (savedPid) {
      // Verify the project still exists in the session
      const listRes = await fetch(`/api/session?sessionId=${sid}`)
      if (listRes.ok) {
        const { projects: list } = await listRes.json()
        const found = list?.find((p: Project) => p.id === savedPid)
        if (found) {
          setProjectId(savedPid); projectIdRef.current = savedPid
          setProjectName(found.name)
          // Load any existing HTML output
          const vfsRes = await fetch(`/api/vfs?sessionId=${sid}&projectId=${savedPid}&path=output.html`)
          if (vfsRes.ok) { const d = await vfsRes.json(); setHtmlOutput(d.content) }
          return
        }
      }
    }
    await createNewProject(sid)
  }

  async function createNewProject(sid?: string) {
    const useSid = sid || sessionIdRef.current
    if (!useSid) return
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: useSid, name: '新建设计' }),
      })
      const data = await res.json()
      if (data.project) {
        setProjectId(data.project.id); projectIdRef.current = data.project.id
        setProjectName(data.project.name)
        setHtmlOutput(null)
        localStorage.setItem('cloud-design-project-id', data.project.id)
      } else if (data.error) {
        // At limit — silently reuse the most recent project
        const listRes = await fetch(`/api/session?sessionId=${useSid}`)
        const listData = await listRes.json()
        const latest = listData.projects?.[0]
        if (latest) {
          setProjectId(latest.id); projectIdRef.current = latest.id
          setProjectName(latest.name)
          localStorage.setItem('cloud-design-project-id', latest.id)
        }
      }
    } catch (e) { console.error('Create project error:', e) }
  }

  async function loadProjects(sid?: string) {
    const useSid = sid || sessionIdRef.current
    if (!useSid) return
    try {
      const res = await fetch(`/api/session?sessionId=${useSid}`)
      const data = await res.json()
      setProjects(data.projects || [])
    } catch { /* silent */ }
  }

  async function renameProject(pid: string, name: string) {
    try {
      await fetch('/api/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: pid, sessionId, updates: { name } }),
      })
      setProjects(prev => prev.map(p => p.id === pid ? { ...p, name } : p))
      if (pid === projectId) setProjectName(name)
    } catch { /* silent */ }
  }

  async function deleteProject(pid: string) {
    try {
      await fetch(`/api/session?projectId=${pid}&sessionId=${sessionIdRef.current}`, { method: 'DELETE' })
      await loadProjects()
    } catch { /* silent */ }
  }

  async function selectProject(project: Project) {
    setProjectId(project.id); projectIdRef.current = project.id
    setProjectName(project.name)
    localStorage.setItem('cloud-design-project-id', project.id)
    setDrawerOpen(false)
    setHtmlOutput(null)
    const res = await fetch(`/api/vfs?sessionId=${sessionIdRef.current}&projectId=${project.id}&path=output.html`)
    if (res.ok) { const d = await res.json(); setHtmlOutput(d.content) }
  }

  function handleDownload() {
    if (!htmlOutput) return
    const blob = new Blob([htmlOutput], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${projectName || 'design'}.html`; a.click()
    URL.revokeObjectURL(url)
  }

  const handleSend = useCallback((images: string[] = [], files: FileAttachment[] = []) => {
    if (!inputText.trim() && images.length === 0 && files.length === 0) return
    if (isLoading) return
    if (!apiKeyRef.current.trim()) { alert('请先输入 API Key'); return }
    sendMessage(inputText, images, files)
    setInputText('')
  }, [inputText, isLoading, sendMessage])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      <TopBar
        provider={provider}
        setProvider={p => { setProvider(p); if (p !== 'custom') setModel(MODEL_OPTIONS[p][0].id) }}
        model={model}
        setModel={setModel}
        customModel={customModel}
        setCustomModel={setCustomModel}
        baseUrl={baseUrl}
        setBaseUrl={setBaseUrl}
        apiKey={apiKey}
        setApiKey={setApiKey}
        onNewProject={() => createNewProject()}
        onToggleDrawer={() => { setDrawerOpen(!drawerOpen); loadProjects() }}
        projectName={projectName}
        isGenerating={isLoading}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <ChatPanel
          messages={messages}
          isGenerating={isLoading}
          input={inputText}
          setInput={setInputText}
          onSend={handleSend}
          onStop={stop}
          streamingContent={isLoading ? streamingText : undefined}
        />
        <PreviewPanel
          htmlContent={htmlOutput}
          isGenerating={isLoading}
          onDownload={handleDownload}
        />
      </div>

      <ProjectDrawer
        isOpen={drawerOpen}
        projects={projects}
        currentProjectId={projectId}
        onSelect={selectProject}
        onDelete={deleteProject}
        onRename={renameProject}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}
