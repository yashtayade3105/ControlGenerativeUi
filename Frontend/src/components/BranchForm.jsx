import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function BranchForm({ title = "Enter Admission Details", fields = [], onSubmit }) {
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  if (submitted) {
    return (
      <div 
        style={{
          padding: '20px',
          borderRadius: '16px',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#a7f3d0',
          textAlign: 'center',
          margin: '16px 0'
        }}
        className="animate-fade-in"
      >
        <CheckCircle2 size={32} style={{ margin: '0 auto 8px auto', color: '#34d399' }} />
        <h4 style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Details Submitted!</h4>
        <p style={{ margin: 0, fontSize: '13px', color: '#6ee7b7' }}>The AI model will now find matching SGBAU engineering colleges.</p>
      </div>
    );
  }

  return (
    <div 
      style={{
        padding: '20px',
        borderRadius: '16px',
        background: 'rgba(17, 24, 39, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        margin: '16px 0'
      }}
      className="animate-fade-in"
    >
      <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>{title}</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {fields.map((field, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#9ca3af' }}>{field.label}</label>
            <input 
              type={field.kind === 'number' ? 'number' : 'text'}
              name={field.name}
              required
              step="any"
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              onChange={handleChange}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        ))}
        <button 
          type="submit"
          style={{
            marginTop: '6px',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#4338ca'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#4f46e5'}
        >
          <Send size={14} />
          <span>Search Matchings</span>
        </button>
      </form>
    </div>
  );
}
