import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQAccordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  if (items.length === 0) return null;

  return (
    <div style={{
      margin: '16px 0',
      padding: '24px',
      borderRadius: '20px',
      background: 'linear-gradient(135deg, rgba(26, 21, 56, 0.4) 0%, rgba(13, 10, 31, 0.2) 100%)',
      border: '1px solid rgba(168, 85, 247, 0.25)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
    }} className="animate-fade-in">
      <h3 style={{ 
        margin: '0 0 20px 0', 
        fontSize: '15px', 
        fontWeight: '700', 
        color: '#ffffff', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        letterSpacing: '0.02em'
      }}>
        <HelpCircle size={18} style={{ color: '#06b6d4' }} />
        <span>Admission FAQs Helpdesk</span>
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              style={{
                borderRadius: '12px',
                border: isOpen ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                background: isOpen ? 'rgba(168, 85, 247, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <button 
                onClick={() => toggle(idx)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  color: isOpen ? '#a855f7' : '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'color 0.2s ease'
                }}
              >
                <span>{item.question}</span>
                {isOpen ? (
                  <ChevronUp size={16} style={{ color: '#a855f7' }} />
                ) : (
                  <ChevronDown size={16} style={{ color: '#9ca3af' }} />
                )}
              </button>
              
              {isOpen && (
                <div style={{
                  padding: '0 18px 16px 18px',
                  fontSize: '13px',
                  color: '#9ca3af',
                  lineHeight: '1.6',
                  borderTop: '1px solid rgba(255, 255, 255, 0.03)',
                  paddingTop: '12px',
                  animation: 'fadeInUp 0.2s ease'
                }}>
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
