import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

export default function DocumentsRequired({ category = 'Open', items = [] }) {
  if (items.length === 0) return null;
  return (
    <div style={{
      margin: '16px 0',
      padding: '20px',
      borderRadius: '16px',
      background: 'rgba(17, 24, 39, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.06)'
    }} className="animate-fade-in">
      <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileText size={18} style={{ color: '#fb7185' }} />
        <span>Required Verification Documents</span>
      </h3>
      <span style={{ fontSize: '11px', color: '#fca5a5', background: 'rgba(244,63,94,0.15)', padding: '2px 8px', borderRadius: '12px', display: 'inline-block', marginBottom: '16px' }}>Category: {category}</span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#cbd5e1' }}>
            <CheckCircle2 size={14} style={{ color: '#fb7185', flexShrink: 0 }} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
