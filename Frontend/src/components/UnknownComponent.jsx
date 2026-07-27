import React from 'react';
import { HelpCircle, AlertTriangle } from 'lucide-react';

export default function UnknownComponent({ type }) {
  return (
    <div 
      style={{
        padding: '16px 20px',
        borderRadius: '12px',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        border: '1px dashed rgba(239, 68, 68, 0.3)',
        color: '#fca5a5',
        margin: '12px 0',
      }}
      className="animate-fade-in"
    >
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <AlertTriangle size={18} className="text-red-400" />
        <span style={{ fontSize: '14px', fontWeight: '600' }}>Fallback Mode Activated</span>
      </div>
      <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#f87171', lineHeight: '1.4' }}>
        The AI model requested a component of type <code style={{ fontFamily: 'monospace', background: 'rgba(0, 0, 0, 0.3)', padding: '2px 6px', borderRadius: '4px', color: '#ffffff' }}>"{type}"</code> which is missing or unregistered in the current frontend registry.
      </p>
    </div>
  );
}
