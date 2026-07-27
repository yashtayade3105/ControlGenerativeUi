import React from 'react';
import { Star } from 'lucide-react';

export default function UserReview({ studentName, year, rating, reviewText }) {
  return (
    <div style={{
      margin: '16px 0',
      padding: '20px',
      borderRadius: '16px',
      background: 'rgba(17, 24, 39, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.06)'
    }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{studentName}</h4>
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Class of {year}</span>
        </div>
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={12} 
              fill={i < rating ? '#fbbf24' : 'none'} 
              color={i < rating ? '#fbbf24' : '#4b5563'} 
            />
          ))}
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', fontStyle: 'italic', lineHeight: '1.5' }}>
        "{reviewText}"
      </p>
    </div>
  );
}
