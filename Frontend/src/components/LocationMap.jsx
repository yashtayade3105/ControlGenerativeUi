import React from 'react';
import { MapPin } from 'lucide-react';

export default function LocationMap({ address, city, distance }) {
  return (
    <div style={{
      margin: '16px 0',
      padding: '20px',
      borderRadius: '16px',
      background: 'rgba(17, 24, 39, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.06)'
    }} className="animate-fade-in">
      <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MapPin size={18} style={{ color: '#ec4899' }} />
        <span>Campus Location & Address</span>
      </h3>
      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.4' }}>{address}</p>
      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#9ca3af' }}>
        <span>City: <strong style={{ color: '#fff' }}>{city}</strong></span>
        <span>Distance from SGBAU: <strong style={{ color: '#fff' }}>{distance}</strong></span>
      </div>
    </div>
  );
}
