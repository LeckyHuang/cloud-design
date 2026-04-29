'use client'

import { useState } from 'react'
import type { CardData } from '@/types'

interface CardRendererProps {
  card: CardData
  onSelect: (response: string) => void
}

const chip = (label: string, active: boolean, onClick: () => void) => (
  <button
    key={label}
    onClick={onClick}
    style={{
      padding: '6px 14px',
      borderRadius: '20px',
      border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      background: active ? 'rgba(99,102,241,0.15)' : 'var(--surface)',
      color: active ? 'var(--accent)' : 'var(--text-2)',
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: 'var(--font-ui)',
      fontWeight: active ? 600 : 400,
      transition: 'all 0.15s',
    }}
  >
    {label}
  </button>
)

function PlatformCard({ card, onSelect }: CardRendererProps) {
  const opts = card.options ?? ['Desktop', 'Mobile', '响应式']
  return (
    <CardShell title={card.title ?? '目标平台'}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {opts.map(opt => (
          <button
            key={opt}
            onClick={() => onSelect(`目标平台：${opt}`)}
            style={{
              flex: 1, minWidth: '80px',
              padding: '10px 8px',
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'var(--font-ui)',
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              const b = e.currentTarget
              b.style.borderColor = 'var(--accent)'
              b.style.background = 'rgba(99,102,241,0.1)'
              b.style.color = 'var(--accent)'
            }}
            onMouseLeave={e => {
              const b = e.currentTarget
              b.style.borderColor = 'var(--border)'
              b.style.background = 'var(--surface)'
              b.style.color = 'var(--text)'
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </CardShell>
  )
}

function DimensionsCard({ card, onSelect }: CardRendererProps) {
  const opts = card.options ?? ['极简主义', '科技感', '温暖人文', '企业商务', '创意个性', '暗黑酷炫']
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggle(opt: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(opt) ? next.delete(opt) : next.add(opt)
      return next
    })
  }

  function confirm() {
    if (selected.size === 0) return
    onSelect(`设计风格偏好：${[...selected].join('、')}`)
  }

  return (
    <CardShell title={card.title ?? '选择设计风格'}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {opts.map(opt => chip(opt, selected.has(opt), () => toggle(opt)))}
      </div>
      <ConfirmBtn disabled={selected.size === 0} onClick={confirm} label="确认风格" />
    </CardShell>
  )
}

function V0ConfirmCard({ card, onSelect }: CardRendererProps) {
  return (
    <CardShell title={card.title ?? '准备好了，开始生成？'}>
      {card.summary && (
        <p style={{
          fontSize: '12px', color: 'var(--text-2)',
          lineHeight: '1.7', margin: '0 0 12px',
          padding: '10px 12px',
          background: 'var(--surface)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
        }}>
          {card.summary}
        </p>
      )}
      <div style={{ display: 'flex', gap: '8px' }}>
        <ConfirmBtn onClick={() => onSelect('开始生成设计稿')} label="🚀 开始生成" />
        <button
          onClick={() => onSelect('我想再调整一下需求')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-2)',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'var(--font-ui)',
          }}
        >
          再想想
        </button>
      </div>
    </CardShell>
  )
}

function ChecklistCard({ card, onSelect }: CardRendererProps) {
  const items = card.items ?? []
  const [checked, setChecked] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const allChecked = items.length > 0 && checked.size === items.length

  return (
    <CardShell title={card.title ?? '设计自检清单'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
        {items.map((item, i) => (
          <label
            key={i}
            onClick={() => toggle(i)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: '6px',
              background: checked.has(i) ? 'rgba(99,102,241,0.08)' : 'transparent',
              transition: 'background 0.15s',
            }}
          >
            <div style={{
              width: '16px', height: '16px', flexShrink: 0, marginTop: '1px',
              borderRadius: '4px',
              border: `1.5px solid ${checked.has(i) ? 'var(--accent)' : 'var(--border)'}`,
              background: checked.has(i) ? 'var(--accent)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}>
              {checked.has(i) && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{
              fontSize: '12px', color: checked.has(i) ? 'var(--text-2)' : 'var(--text)',
              textDecoration: checked.has(i) ? 'line-through' : 'none',
              lineHeight: '1.5',
              transition: 'all 0.15s',
            }}>
              {item}
            </span>
          </label>
        ))}
      </div>
      <ConfirmBtn
        disabled={!allChecked}
        onClick={() => onSelect('自检完成，交付设计稿')}
        label={allChecked ? '✓ 全部完成，交付' : `还剩 ${items.length - checked.size} 项未完成`}
      />
    </CardShell>
  )
}

function CardShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      marginTop: '12px',
      padding: '14px',
      background: 'rgba(99,102,241,0.06)',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: '12px',
    }}>
      <div style={{
        fontSize: '11px', fontWeight: 700,
        color: 'var(--accent)',
        letterSpacing: '0.5px',
        marginBottom: '10px',
        textTransform: 'uppercase',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function ConfirmBtn({ onClick, label, disabled = false }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 16px',
        background: disabled ? 'var(--surface-hi)' : 'var(--accent-grad)',
        border: 'none',
        borderRadius: '8px',
        color: disabled ? 'var(--text-3)' : 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '12px',
        fontFamily: 'var(--font-ui)',
        fontWeight: 600,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}

export default function CardRenderer({ card, onSelect }: CardRendererProps) {
  switch (card.type) {
    case 'platform':    return <PlatformCard card={card} onSelect={onSelect} />
    case 'dimensions':  return <DimensionsCard card={card} onSelect={onSelect} />
    case 'v0-confirm':  return <V0ConfirmCard card={card} onSelect={onSelect} />
    case 'checklist':   return <ChecklistCard card={card} onSelect={onSelect} />
    default:            return null
  }
}

export function parseCard(content: string): { text: string; card: CardData | null } {
  const match = content.match(/\[\[CARD:(\{[\s\S]*?\})\]\]/)
  if (!match) return { text: content, card: null }
  try {
    const card = JSON.parse(match[1]) as CardData
    const text = content.replace(match[0], '').trim()
    return { text, card }
  } catch {
    return { text: content, card: null }
  }
}
