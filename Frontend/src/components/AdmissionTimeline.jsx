import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

export default function AdmissionTimeline({ events = [] }) {
  if (events.length === 0) return null;
  return (
    <div style={{
      margin: '16px 0',
      padding: '20px',
      borderRadius: '16px',
      background: 'rgba(17, 24, 39, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.06)'
    }} className="animate-fade-in">
      <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar size={18} style={{ color: '#818cf8' }} />
        <span>CAP Round Timeline Schedule</span>
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {events.map((event, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ color: '#818cf8', fontWeight: 'bold', fontSize: '12px', minWidth: '80px' }}>{event.date}</div>
            <ChevronRight size={14} style={{ color: '#4b5563' }} />
            <div style={{ color: '#cbd5e1', fontSize: '13px' }}>{event.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
