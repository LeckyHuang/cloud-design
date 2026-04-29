'use client'

import { marked, Renderer } from 'marked'
import { useMemo } from 'react'
import type { FileAttachment } from '@/lib/useStream'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  images?: string[]
  files?: FileAttachment[]
  isStreaming?: boolean
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['html', 'htm'].includes(ext)) return '🌐'
  if (['css'].includes(ext)) return '🎨'
  if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return '⚡'
  if (['json', 'yaml', 'yml'].includes(ext)) return '📋'
  if (['md', 'markdown', 'txt'].includes(ext)) return '📝'
  if (['svg'].includes(ext)) return '🖼'
  return '📄'
}

// Configure marked once — custom renderer wraps tables for scroll + rounded border
const renderer = new Renderer()
const _baseTableRenderer = renderer.table.bind(renderer)
renderer.table = function (token) {
  return `<div class="md-table-wrap">${_baseTableRenderer(token)}</div>`
}
marked.use({ renderer, breaks: true })

export default function MessageBubble({ role, content, images, files, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user'

  const html = useMemo(() => {
    if (isUser) return null
    return marked.parse(content) as string
  }, [content, isUser])

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '12px',
      padding: '0 16px',
    }}>
      {!isUser && (
        <div style={{
          width: '28px', height: '28px',
          background: 'var(--accent-grad)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          marginRight: '8px',
          marginTop: '2px',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      <div style={{
        maxWidth: isUser ? '75%' : '90%',
        padding: isUser ? '8px 12px' : '10px 14px',
        background: isUser ? 'var(--accent)' : 'var(--surface)',
        borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
        color: 'var(--text)',
        fontSize: '14px',
        lineHeight: '1.6',
        wordBreak: 'break-word',
        position: 'relative',
      }}>
        {isUser ? (
          <>
            {images && images.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                marginBottom: content.trim() ? '8px' : '0',
              }}>
                {images.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt=""
                    style={{
                      maxHeight: '120px',
                      maxWidth: '100%',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ))}
              </div>
            )}
            {files && files.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '5px',
                marginBottom: content.trim() ? '8px' : '0',
              }}>
                {files.map((f, i) => (
                  <div key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 8px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '5px',
                    fontSize: '12px',
                    maxWidth: '180px',
                  }}>
                    <span style={{ flexShrink: 0 }}>{fileIcon(f.name)}</span>
                    <span style={{
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{f.name}</span>
                  </div>
                ))}
              </div>
            )}
            {content.trim() && (
              <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>
            )}
          </>
        ) : (
          <div
            className="md-body"
            dangerouslySetInnerHTML={{ __html: html || '' }}
          />
        )}
        {isStreaming && (
          <span style={{
            display: 'inline-block',
            width: '2px', height: '14px',
            background: 'var(--text-2)',
            marginLeft: '2px',
            verticalAlign: 'middle',
            animation: 'blink 1s step-end infinite',
          }} />
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* ── Paragraphs & spacing ── */
        .md-body p { margin: 0 0 8px; }
        .md-body p:last-child { margin-bottom: 0; }

        /* ── Headings ── */
        .md-body h1 {
          font-size: 17px; font-weight: 700;
          margin: 16px 0 8px; color: var(--text);
          border-bottom: 1px solid var(--border);
          padding-bottom: 6px;
        }
        .md-body h1:first-child { margin-top: 4px; }
        .md-body h2 {
          font-size: 15px; font-weight: 700;
          margin: 16px 0 6px; color: var(--text);
        }
        .md-body h3 {
          font-size: 13px; font-weight: 600;
          margin: 12px 0 4px; color: var(--text-2);
          text-transform: uppercase; letter-spacing: 0.4px;
        }
        .md-body h4 {
          font-size: 13px; font-weight: 600;
          margin: 10px 0 4px; color: var(--text-2);
        }

        /* ── Lists ── */
        .md-body ul, .md-body ol {
          padding-left: 20px; margin: 4px 0 10px;
        }
        .md-body li { margin: 4px 0; line-height: 1.6; }

        /* ── Inline code ── */
        .md-body code {
          background: var(--surface-hi);
          padding: 1px 5px;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 12.5px;
        }

        /* ── Code blocks ── */
        .md-body pre {
          background: var(--surface-hi);
          border: 1px solid var(--border);
          padding: 12px 14px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 10px 0;
        }
        .md-body pre code {
          background: none; padding: 0;
          font-size: 12.5px; line-height: 1.65;
        }

        /* ── Tables ── */
        .md-table-wrap {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid var(--border);
          margin: 10px 0;
        }
        .md-body table {
          border-collapse: collapse;
          width: 100%;
          font-size: 12.5px;
        }
        .md-body th {
          background: var(--surface-hi);
          font-weight: 600;
          padding: 7px 10px;
          text-align: left;
          color: var(--text-2);
          font-size: 11px;
          letter-spacing: 0.3px;
          border-bottom: 1px solid var(--border);
        }
        .md-body td {
          padding: 7px 10px;
          border-bottom: 1px solid var(--border);
          color: var(--text);
        }
        .md-body tr:last-child td { border-bottom: none; }
        .md-body tbody tr:nth-child(even) td {
          background: rgba(128,128,128,0.04);
        }

        /* ── Blockquote / callout card ── */
        .md-body blockquote {
          background: rgba(99, 102, 241, 0.08);
          border-left: 3px solid var(--accent);
          border-radius: 0 8px 8px 0;
          margin: 10px 0;
          padding: 10px 14px;
          color: var(--text);
        }
        .md-body blockquote p { margin: 0; }

        /* ── HR ── */
        .md-body hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 14px 0;
        }

        /* ── Strong / em ── */
        .md-body strong { font-weight: 700; color: var(--text); }
        .md-body em { font-style: italic; color: var(--text-2); }

        /* ── Links ── */
        .md-body a { color: var(--accent); text-decoration: none; }
        .md-body a:hover { text-decoration: underline; }
      `}</style>
    </div>
  )
}
