import React from 'react';
import { TrendingUp, Briefcase } from 'lucide-react';

export default function PlacementStats({ highestPackage, averagePackage, recruiters = [] }) {
  return (
    <div style={{
      margin: '16px 0',
      padding: '20px',
      borderRadius: '16px',
      background: 'rgba(17, 24, 39, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.06)'
    }} className="animate-fade-in">
      <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TrendingUp size={18} style={{ color: '#60a5fa' }} />
        <span>Placement Metrics Highlights</span>
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Highest Package CTC</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#60a5fa' }}>{highestPackage} LPA</span>
        </div>
        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Average Package CTC</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#34d399' }}>{averagePackage} LPA</span>
        </div>
      </div>
      <div>
        <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Top Recruiting Partners:</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {recruiters.map((rec, idx) => (
            <span key={idx} style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: '#cbd5e1' }}>
              {rec}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
