import React from 'react';
import { Phone, Mail } from 'lucide-react';

export default function ContactCard({ officer, helpline, email }) {
  return (
    <div style={{
      margin: '16px 0',
      padding: '20px',
      borderRadius: '16px',
      background: 'rgba(17, 24, 39, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.06)'
    }} className="animate-fade-in">
      <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>Admission Helpdesk</h3>
      <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#9ca3af' }}>Officer-in-charge: <strong style={{ color: '#fff' }}>{officer}</strong></p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#cbd5e1' }}>
          <Phone size={14} style={{ color: '#818cf8' }} />
          <span>{helpline}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#cbd5e1' }}>
          <Mail size={14} style={{ color: '#818cf8' }} />
          <span>{email}</span>
        </div>
      </div>
    </div>
  );
}
