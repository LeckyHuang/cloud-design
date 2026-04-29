'use client'

import { useState, useRef, useEffect } from 'react'
import type { Project } from '@/types'

interface ProjectDrawerProps {
  isOpen: boolean
  projects: Project[]
  currentProjectId: string
  onSelect: (project: Project) => void
  onDelete: (projectId: string) => void
  onRename: (projectId: string, name: string) => void
  onClose: () => void
}

function timeLeft(expiresAt: number): string {
  const diff = expiresAt - Date.now()
  if (diff <= 0) return '已过期'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 24) return `${hours}小时后过期`
  const days = Math.floor(hours / 24)
  return `${days}天后过期`
}

export default function ProjectDrawer({
  isOpen,
  projects,
  currentProjectId,
  onSelect,
  onDelete,
  onRename,
  onClose,
}: ProjectDrawerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId) inputRef.current?.focus()
  }, [editingId])

  function startEdit(p: Project, e: React.MouseEvent) {
    e.stopPropagation()
    setEditingId(p.id)
    setEditingName(p.name)
  }

  function commitEdit(id: string) {
    const trimmed = editingName.trim()
    if (trimmed) onRename(id, trimmed)
    setEditingId(null)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          zIndex: 200,
          background: 'rgba(0,0,0,0.4)',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '320px',
        background: 'var(--panel-left)',
        borderLeft: '1px solid var(--border)',
        zIndex: 201,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>我的项目</div>
            <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>
              最多保存 3 个，有效期 3 天
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '28px', height: '28px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '7px',
              color: 'var(--text-2)',
              cursor: 'pointer', fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>

        {/* Project list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          {projects.length === 0 ? (
            <div style={{
              padding: '32px 16px', textAlign: 'center',
              color: 'var(--text-3)', fontSize: '13px',
            }}>
              暂无项目记录
            </div>
          ) : (
            projects.map(p => (
              <div
                key={p.id}
                onClick={() => onSelect(p)}
                style={{
                  padding: '12px',
                  background: p.id === currentProjectId ? 'var(--surface-hi)' : 'var(--surface)',
                  border: `1px solid ${p.id === currentProjectId ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {editingId === p.id ? (
                    <input
                      ref={inputRef}
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={() => commitEdit(p.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitEdit(p.id)
                        if (e.key === 'Escape') setEditingId(null)
                        e.stopPropagation()
                      }}
                      onClick={e => e.stopPropagation()}
                      style={{
                        flex: 1, marginRight: '8px',
                        fontWeight: 600, fontSize: '13px',
                        background: 'var(--surface)',
                        border: '1px solid var(--accent)',
                        borderRadius: '5px',
                        color: 'var(--text)',
                        padding: '2px 6px',
                        fontFamily: 'var(--font-ui)',
                        outline: 'none',
                      }}
                    />
                  ) : (
                    <div
                      onDoubleClick={e => startEdit(p, e)}
                      title="双击重命名"
                      style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px', cursor: 'text', flex: 1 }}
                    >
                      {p.name}
                    </div>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(p.id) }}
                    style={{
                      background: 'transparent', border: 'none',
                      color: 'var(--text-3)', cursor: 'pointer',
                      padding: '0 2px', fontSize: '14px',
                      flexShrink: 0,
                    }}
                    title="删除"
                  >×</button>
                </div>
                <div style={{
                  display: 'flex', gap: '8px', alignItems: 'center',
                  fontSize: '11px',
                }}>
                  <span style={{
                    padding: '2px 6px',
                    background: 'rgba(99,102,241,0.15)',
                    color: 'var(--accent)',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}>
                    {timeLeft(p.expiresAt)}
                  </span>
                  <span style={{ color: 'var(--text-3)' }}>
                    {p.messages.length} 条消息
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
