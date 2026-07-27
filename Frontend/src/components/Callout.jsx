import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export default function Callout({ tone = 'info', text }) {
  const configs = {
    info: {
      bg: 'linear-gradient(90deg, rgba(6, 182, 212, 0.15) 0%, rgba(12, 11, 23, 0.2) 100%)',
      border: 'rgba(6, 182, 212, 0.3)',
      text: '#e0f2fe',
      icon: <Info size={18} style={{ color: '#22d3ee' }} />
    },
    success: {
      bg: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(12, 11, 23, 0.2) 100%)',
      border: 'rgba(16, 185, 129, 0.3)',
      text: '#ecfdf5',
      icon: <CheckCircle size={18} style={{ color: '#34d399' }} />
    },
    warn: {
      bg: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(12, 11, 23, 0.2) 100%)',
      border: 'rgba(245, 158, 11, 0.3)',
      text: '#fffbeb',
      icon: <AlertTriangle size={18} style={{ color: '#fbbf24' }} />
    },
    danger: {
      bg: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(12, 11, 23, 0.2) 100%)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: '#fef2f2',
      icon: <AlertCircle size={18} style={{ color: '#f87171' }} />
    }
  };

  const current = configs[tone] || configs.info;

  return (
    <div 
      style={{
        display: 'flex',
        gap: '14px',
        padding: '16px 20px',
        borderRadius: '16px',
        backgroundColor: 'transparent',
        backgroundImage: current.bg,
        border: `1px solid ${current.border}`,
        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.15)',
        color: current.text,
        fontSize: '13.5px',
        fontWeight: '500',
        lineHeight: '1.6',
        margin: '14px 0',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="animate-fade-in"
    >
      {/* Decorative vertical colored stripe on left border edge */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        background: current.border
      }} />

      <div style={{ flexShrink: 0, marginTop: '2px', display: 'flex', alignItems: 'center' }}>
        {current.icon}
      </div>
      <div style={{ paddingLeft: '2px' }}>{text}</div>
    </div>
  );
}
