import React from 'react';
import { Terminal, Cpu, Play } from 'lucide-react';
import { THEME } from './Theme';

export default function PresetsPanel({
  MOCK_SPECS,
  activeKey,
  handlePresetSelect,
  customSpecText,
  setCustomSpecText,
  handleApplySpec,
  errorMsg,
  jsonTokenCount,
  htmlTokenCount,
  tokenSavingPercent
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '-8px' }}>
        {Object.keys(MOCK_SPECS).map((key) => (
          <button
            key={key}
            onClick={() => handlePresetSelect(key)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.06)',
              backgroundColor: activeKey === key ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.02)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {MOCK_SPECS[key].title}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: `1px solid ${THEME.border}` }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${THEME.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
            <Terminal size={14} style={{ color: THEME.teal }} />
            <span>JSON UI Schema Spec (Model Output)</span>
          </div>
          <button 
            onClick={handleApplySpec}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#10b981',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Play size={11} />
            Apply Schema
          </button>
        </div>

        <textarea
          value={customSpecText}
          onChange={(e) => setCustomSpecText(e.target.value)}
          style={{
            flex: 1,
            padding: '16px',
            backgroundColor: '#070a13',
            color: '#34d399',
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: '1.6',
            border: 'none',
            resize: 'none',
            outline: 'none'
          }}
        />

        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(239,68,68,0.15)',
            borderTop: '1px solid rgba(239,68,68,0.3)',
            padding: '10px 16px',
            color: '#fca5a5',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {errorMsg}
          </div>
        )}
      </div>

      {/* Token Savings Metric Console */}
      <div className="glass-panel" style={{ padding: '16px', border: `1px solid ${THEME.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Cpu size={16} style={{ color: THEME.accent }} />
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#cbd5e1' }}>Generative UI Savings Metrics</h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '16px' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>JSON Spec Size</span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: THEME.teal }}>~{jsonTokenCount} <span style={{ fontSize: '11px', fontWeight: '400', color: '#9ca3af' }}>Tokens</span></span>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Equivalent HTML Size (Illustrative)</span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444' }}>~{htmlTokenCount} <span style={{ fontSize: '11px', fontWeight: '400', color: '#9ca3af' }}>Tokens</span></span>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(6,182,212,0.05) 100%)', padding: '10px', borderRadius: '8px', border: `1px solid ${THEME.border}` }}>
            <span style={{ fontSize: '11px', color: '#c084fc', display: 'block', marginBottom: '4px' }}>Token Saving Savings</span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
              {tokenSavingPercent > 0 ? `${tokenSavingPercent}% Saving` : '100%'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
