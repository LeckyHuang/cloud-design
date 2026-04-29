'use client'

import { useState } from 'react'

interface PreviewPanelProps {
  htmlContent: string | null
  isGenerating: boolean
  onDownload: () => void
}

export default function PreviewPanel({ htmlContent, isGenerating, onDownload }: PreviewPanelProps) {
  const [zoom, setZoom] = useState(100)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')

  const mobileWidth = 390

  return (
    <div style={{
      flex: 1,
      background: 'var(--panel-right)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderLeft: '1px solid var(--border)',
    }}>
      {/* Preview toolbar */}
      <div style={{
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: '8px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.5px' }}>
          PREVIEW
        </span>

        <div style={{ flex: 1 }} />

        {/* View mode toggle */}
        <div style={{
          display: 'flex',
          background: 'var(--surface)',
          borderRadius: '7px',
          padding: '2px',
          border: '1px solid var(--border)',
        }}>
          {(['desktop', 'mobile'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '3px 8px',
                borderRadius: '5px',
                border: 'none',
                background: viewMode === mode ? 'var(--surface-hi)' : 'transparent',
                color: viewMode === mode ? 'var(--text)' : 'var(--text-3)',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'var(--font-ui)',
              }}
            >
              {mode === 'desktop' ? '🖥' : '📱'}
            </button>
          ))}
        </div>

        {/* Zoom controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setZoom(z => Math.max(25, z - 25))}
            style={{
              width: '24px', height: '24px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-2)',
              cursor: 'pointer', fontSize: '14px',
            }}
          >−</button>
          <span style={{ fontSize: '12px', color: 'var(--text-3)', minWidth: '36px', textAlign: 'center' }}>
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(150, z + 25))}
            style={{
              width: '24px', height: '24px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-2)',
              cursor: 'pointer', fontSize: '14px',
            }}
          >+</button>
        </div>

        {/* Download */}
        {htmlContent && (
          <button
            onClick={onDownload}
            style={{
              padding: '4px 12px',
              background: 'var(--accent-grad)',
              border: 'none',
              borderRadius: '7px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'var(--font-ui)',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            下载
          </button>
        )}
      </div>

      {/* Preview area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px',
        background: 'repeating-conic-gradient(var(--surface) 0% 25%, transparent 0% 50%) 0 0 / 20px 20px',
      }}>
        {isGenerating && !htmlContent && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '16px', paddingTop: '80px', color: 'var(--text-3)',
          }}>
            <div style={{
              width: '48px', height: '48px',
              border: '3px solid var(--border)',
              borderTop: '3px solid var(--accent)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <span style={{ fontSize: '13px' }}>设计师正在创作中…</span>
          </div>
        )}

        {!isGenerating && !htmlContent && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '12px', paddingTop: '80px', color: 'var(--text-3)',
          }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="12" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 18h32" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
              <circle cx="17" cy="15" r="1.5" fill="currentColor"/>
              <circle cx="22" cy="15" r="1.5" fill="currentColor"/>
            </svg>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>预览区</span>
            <span style={{ fontSize: '12px' }}>设计完成后，HTML 会在此实时显示</span>
          </div>
        )}

        {htmlContent && (
          <div style={{
            width: viewMode === 'mobile' ? `${mobileWidth}px` : '100%',
            maxWidth: viewMode === 'mobile' ? `${mobileWidth}px` : 'none',
            // Use zoom (not transform:scale) so pointer events stay correctly aligned
            zoom: zoom / 100,
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            borderRadius: '8px',
            overflow: 'hidden',
            background: 'white',
          }}>
            <iframe
              srcDoc={htmlContent}
              style={{
                width: '100%',
                // Tall enough to show most designs without internal scroll
                height: viewMode === 'mobile' ? '844px' : '2400px',
                border: 'none',
                display: 'block',
              }}
              title="设计预览"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
