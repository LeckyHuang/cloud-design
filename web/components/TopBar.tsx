'use client'

import { useState } from 'react'
import type { Provider } from '@/types'
import { MODEL_OPTIONS, CUSTOM_PRESETS } from '@/lib/providers'

interface TopBarProps {
  provider: Provider
  setProvider: (p: Provider) => void
  model: string
  setModel: (m: string) => void
  customModel: string
  setCustomModel: (m: string) => void
  baseUrl: string
  setBaseUrl: (u: string) => void
  apiKey: string
  setApiKey: (k: string) => void
  onNewProject: () => void
  onToggleDrawer: () => void
  projectName: string
  isGenerating: boolean
}

const PROVIDER_LABELS: Record<Provider, string> = {
  anthropic: 'Claude',
  openai: 'OpenAI',
  google: 'Google',
  custom: '自定义',
}

const PROVIDER_COLORS: Record<Provider, string> = {
  anthropic: '#D97706',
  openai: '#10B981',
  google: '#3B82F6',
  custom: '#A855F7',
}

export default function TopBar({
  provider,
  setProvider,
  model,
  setModel,
  customModel,
  setCustomModel,
  baseUrl,
  setBaseUrl,
  apiKey,
  setApiKey,
  onNewProject,
  onToggleDrawer,
  projectName,
  isGenerating,
}: TopBarProps) {
  const [showKey, setShowKey] = useState(false)
  const [showProviderMenu, setShowProviderMenu] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  const handleProviderChange = (p: Provider) => {
    setProvider(p)
    if (p !== 'custom') setModel(MODEL_OPTIONS[p][0].id)
    setShowProviderMenu(false)
  }

  const handlePreset = (preset: typeof CUSTOM_PRESETS[0]) => {
    setBaseUrl(preset.baseUrl)
    setCustomModel(preset.placeholder)
    setShowPresets(false)
  }

  const isCustom = provider === 'custom'

  return (
    <header style={{
      height: isCustom ? '88px' : '52px',
      background: 'var(--panel-top)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 16px',
      flexShrink: 0,
      position: 'relative',
      zIndex: 50,
      transition: 'height 0.2s ease',
    }}>
      {/* Main row */}
      <div style={{ height: '52px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'var(--accent-grad)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.3px' }}>Cloud Design</span>
        </div>

        {/* Project name */}
        <div style={{
          flex: 1, textAlign: 'center',
          color: 'var(--text-2)', fontSize: '13px', fontWeight: 500,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {projectName}
          {isGenerating && (
            <span style={{ marginLeft: '8px', display: 'inline-flex', gap: '3px', alignItems: 'center', verticalAlign: 'middle' }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)',
                  animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite`,
                }} />
              ))}
            </span>
          )}
        </div>

        {/* Provider selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProviderMenu(!showProviderMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 10px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text)', cursor: 'pointer',
              fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-ui)',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: PROVIDER_COLORS[provider], flexShrink: 0 }} />
            {PROVIDER_LABELS[provider]}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {showProviderMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '4px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '10px', overflow: 'hidden', minWidth: '160px',
              zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              {(Object.keys(PROVIDER_LABELS) as Provider[]).map(p => (
                <button key={p} onClick={() => handleProviderChange(p)} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                  padding: '8px 12px',
                  background: p === provider ? 'var(--surface-hi)' : 'transparent',
                  border: 'none', color: 'var(--text)', cursor: 'pointer',
                  fontSize: '13px', fontFamily: 'var(--font-ui)', textAlign: 'left',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: PROVIDER_COLORS[p], flexShrink: 0 }} />
                  {PROVIDER_LABELS[p]}
                  {p === 'custom' && <span style={{ fontSize: '11px', color: 'var(--text-3)', marginLeft: 'auto' }}>OpenAI 兼容</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Model selector — dropdown for standard providers, text input for custom */}
        {!isCustom ? (
          <select value={model} onChange={e => setModel(e.target.value)} style={{
            padding: '5px 8px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '8px', color: 'var(--text)', fontSize: '13px',
            fontFamily: 'var(--font-ui)', cursor: 'pointer', maxWidth: '180px',
          }}>
            {MODEL_OPTIONS[provider].map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        ) : (
          <input
            value={customModel}
            onChange={e => setCustomModel(e.target.value)}
            placeholder="Model ID，如 deepseek-chat"
            style={{
              width: '180px', padding: '5px 8px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text)', fontSize: '13px',
              fontFamily: 'var(--font-mono)',
            }}
          />
        )}

        {/* API Key */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="API Key"
            style={{
              width: '160px', padding: '5px 8px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text)', fontSize: '13px',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <button onClick={() => setShowKey(!showKey)} style={{
            padding: '5px', background: 'transparent', border: 'none',
            color: 'var(--text-3)', cursor: 'pointer',
          }} title={showKey ? '隐藏' : '显示'}>
            {showKey ? '🙈' : '👁️'}
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button onClick={onToggleDrawer} style={{
            padding: '5px 10px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '8px', color: 'var(--text-2)', cursor: 'pointer',
            fontSize: '13px', fontFamily: 'var(--font-ui)',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2" width="12" height="2" rx="1" fill="currentColor"/>
              <rect x="1" y="6" width="12" height="2" rx="1" fill="currentColor"/>
              <rect x="1" y="10" width="8" height="2" rx="1" fill="currentColor"/>
            </svg>
            项目
          </button>
          <button onClick={onNewProject} style={{
            padding: '5px 12px',
            background: 'var(--accent-grad)', border: 'none',
            borderRadius: '8px', color: 'white', cursor: 'pointer',
            fontSize: '13px', fontFamily: 'var(--font-ui)', fontWeight: 600,
          }}>
            + 新设计
          </button>
        </div>
      </div>

      {/* Custom provider second row: Base URL + presets */}
      {isCustom && (
        <div style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-3)', flexShrink: 0 }}>Base URL</span>

          <input
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            placeholder="https://api.deepseek.com/v1"
            style={{
              flex: 1, padding: '4px 8px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '7px', color: 'var(--text)', fontSize: '12px',
              fontFamily: 'var(--font-mono)',
            }}
          />

          {/* Presets picker */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={() => setShowPresets(!showPresets)} style={{
              padding: '4px 10px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '7px', color: 'var(--text-2)', cursor: 'pointer',
              fontSize: '12px', fontFamily: 'var(--font-ui)',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              快速填入
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {showPresets && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '10px', overflow: 'hidden', minWidth: '240px',
                zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}>
                {CUSTOM_PRESETS.map(preset => (
                  <button key={preset.label} onClick={() => handlePreset(preset)} style={{
                    display: 'flex', flexDirection: 'column', width: '100%',
                    padding: '8px 12px', gap: '2px',
                    background: 'transparent', border: 'none',
                    color: 'var(--text)', cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'var(--font-ui)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hi)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{preset.label}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                      {preset.baseUrl}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        select option { background: #2C2C32; }
      `}</style>
    </header>
  )
}
