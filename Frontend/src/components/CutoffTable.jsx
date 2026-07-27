import React from 'react';
import { Calendar, Layers, Percent } from 'lucide-react';

export default function CutoffTable({ rows }) {
  if (!rows || rows.length === 0) return null;

  return (
    <div 
      style={{
        margin: '16px 0',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(10, 15, 30, 0.6)',
      }}
      className="animate-fade-in"
    >
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(255, 255, 255, 0.02)',
        fontSize: '13px',
        fontWeight: '600',
        color: '#9ca3af',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <Layers size={14} />
        <span>SGBAU Cutoff Trends & Percentiles</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.01)' }}>
              <th style={{ padding: '12px 16px', color: '#9ca3af', fontWeight: '500' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} /> Year</div>
              </th>
              <th style={{ padding: '12px 16px', color: '#9ca3af', fontWeight: '500' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={13} /> Admission Round</div>
              </th>
              <th style={{ padding: '12px 16px', color: '#9ca3af', fontWeight: '500', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}><Percent size={13} /> Cutoff %</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr 
                key={idx} 
                style={{ 
                  borderBottom: idx === rows.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '12px 16px', color: '#ffffff', fontWeight: '500' }}>{row.year}</td>
                <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>Round {row.round}</td>
                <td style={{ padding: '12px 16px', color: '#3b82f6', fontWeight: '600', textAlign: 'right' }}>{row.cutoff}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
