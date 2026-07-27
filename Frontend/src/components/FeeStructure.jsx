import React from 'react';
import { CreditCard } from 'lucide-react';

export default function FeeStructure({ totalFee, categoryBreakdown = [] }) {
  return (
    <div style={{
      margin: '16px 0',
      padding: '20px',
      borderRadius: '16px',
      background: 'rgba(17, 24, 39, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.06)'
    }} className="animate-fade-in">
      <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CreditCard size={18} style={{ color: '#34d399' }} />
        <span>Annual Fee Structure Split</span>
      </h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: '13px', color: '#9ca3af' }}>General Open Category Base:</span>
        <span style={{ fontSize: '18px', fontWeight: '800', color: '#34d399' }}>₹{totalFee}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {categoryBreakdown.map((cat, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' }}>
            <span>{cat.category}:</span>
            <span style={{ fontWeight: '600' }}>₹{cat.fee}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
