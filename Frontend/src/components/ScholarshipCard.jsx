import React from 'react';
import { Gift } from 'lucide-react';

export default function ScholarshipCard({ name, criteria, benefitAmount }) {
  return (
    <div style={{
      margin: '16px 0',
      padding: '16px 20px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)',
      border: '1px solid rgba(245, 158, 11, 0.2)'
    }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#f59e0b', fontSize: '14px', fontWeight: '700' }}>
          <Gift size={16} />
          <span>{name}</span>
        </div>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#fbbf24', backgroundColor: 'rgba(245,158,11,0.15)', padding: '2px 8px', borderRadius: '4px' }}>
          {benefitAmount}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1' }}><strong>Criteria:</strong> {criteria}</p>
    </div>
  );
}
