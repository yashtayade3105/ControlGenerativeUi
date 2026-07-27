import React from 'react';
import { School, Award, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export default function CollegeCard({ name, code, chance }) {
  const chanceConfig = {
    High: {
      bg: 'rgba(16, 185, 129, 0.15)',
      text: '#10b981',
      icon: <CheckCircle2 size={16} />,
      label: 'High Chance'
    },
    Medium: {
      bg: 'rgba(59, 130, 246, 0.15)',
      text: '#3b82f6',
      icon: <Award size={16} />,
      label: 'Medium Chance'
    },
    Borderline: {
      bg: 'rgba(245, 158, 11, 0.15)',
      text: '#f59e0b',
      icon: <AlertCircle size={16} />,
      label: 'Borderline'
    }
  };

  const currentChance = chanceConfig[chance] || {
    bg: 'rgba(156, 163, 175, 0.15)',
    text: '#9ca3af',
    icon: <HelpCircle size={16} />,
    label: 'Unknown'
  };

  return (
    <div 
      style={{
        padding: '20px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        margin: '16px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'transform 0.2s ease, border-color 0.2s ease'
      }}
      className="animate-fade-in"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ 
            backgroundColor: 'rgba(99, 102, 241, 0.15)', 
            padding: '10px', 
            borderRadius: '12px',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <School size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{name}</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>DTE Code: <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{code}</span></p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: currentChance.bg,
          color: currentChance.text,
          border: `1px solid ${currentChance.text}33`
        }}>
          {currentChance.icon}
          <span>{currentChance.label}</span>
        </div>
      </div>
    </div>
  );
}
