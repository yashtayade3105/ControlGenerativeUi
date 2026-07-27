import React from 'react';
import { Award } from 'lucide-react';

export default function FacilitiesList({ facilities = [] }) {
  if (facilities.length === 0) return null;
  return (
    <div style={{
      margin: '16px 0',
      padding: '20px',
      borderRadius: '16px',
      background: 'rgba(17, 24, 39, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.06)'
    }} className="animate-fade-in">
      <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Award size={18} style={{ color: '#a78bfa' }} />
        <span>Campus Facilities & Amenities</span>
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {facilities.map((fac, idx) => (
          <span key={idx} style={{
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(167, 139, 250, 0.1)',
            color: '#c084fc',
            border: '1px solid rgba(167, 139, 250, 0.2)',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {fac}
          </span>
        ))}
      </div>
    </div>
  );
}
