import React from 'react';
import { Sparkles, Eye, EyeOff, Loader2, LogIn, UserPlus, CheckCircle2, ShieldAlert } from 'lucide-react';
import { THEME } from './Theme';

export default function AuthView({
  authMode,
  setAuthMode,
  authEmail,
  setAuthEmail,
  authName,
  setAuthName,
  authPassword,
  setAuthPassword,
  authOtp,
  setAuthOtp,
  showPassword,
  setShowPassword,
  authError,
  setAuthError,
  authSuccess,
  isLoadingAuth,
  handleLogin,
  handleRequestOtp,
  handleRegister
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: `radial-gradient(circle at top right, rgba(168, 85, 247, 0.15), transparent 45%),
                  radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.15), transparent 45%),
                  ${THEME.bg}`,
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{
        width: '90%',
        maxWidth: '430px',
        padding: '40px',
        borderRadius: '24px',
        background: THEME.panelBg,
        border: `1px solid ${THEME.border}`,
        backdropFilter: 'blur(16px)',
        boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.6), 0 0 15px 0 rgba(168, 85, 247, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }} className="animate-fade-in">
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
            color: '#fff',
            marginBottom: '16px',
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)'
          }}>
            <Sparkles size={28} />
          </div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '24px', fontWeight: '800', tracking: '-0.025em' }}>
            SGBAU <span style={{ color: THEME.teal }}>Nexus AI</span>
          </h2>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#9c92cf' }}>Controlled Generative UI Admission Portal</p>
        </div>

        {/* Login Mode */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#cbd5e1', letterSpacing: '0.05em' }}>Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#cbd5e1', letterSpacing: '0.05em' }}>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter account password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingAuth}
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.25)',
                transition: 'transform 0.2s'
              }}
            >
              {isLoadingAuth ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              <span>Login Securely</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>New to Nexus Portal? </span>
              <button
                type="button"
                onClick={() => { setAuthMode('signup_otp'); setAuthError(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: THEME.teal,
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                  padding: 0
                }}
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* OTP Verification Request */}
        {authMode === 'signup_otp' && (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#cbd5e1', letterSpacing: '0.05em' }}>Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingAuth}
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.25)'
              }}
            >
              {isLoadingAuth ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              <span>Send verification OTP</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>Already verified? </span>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: THEME.accent,
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                  padding: 0
                }}
              >
                Log In
              </button>
            </div>
          </form>
        )}

        {/* Register Account */}
        {authMode === 'signup_register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#cbd5e1', letterSpacing: '0.05em' }}>Full Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Rajesh Patil"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#cbd5e1', letterSpacing: '0.05em' }}>6-Digit OTP Code</label>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="Enter 6-digit OTP code"
                value={authOtp}
                onChange={(e) => setAuthOtp(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  letterSpacing: '4px',
                  textAlign: 'center'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#cbd5e1', letterSpacing: '0.05em' }}>Create Password</label>
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingAuth}
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.25)'
              }}
            >
              {isLoadingAuth ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>Complete Account Setup</span>
            </button>
          </form>
        )}

        {/* Feedback messages */}
        {authError && (
          <div style={{
            padding: '12px',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#fca5a5',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div style={{
            padding: '12px',
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#a7f3d0',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{authSuccess}</span>
          </div>
        )}
      </div>
    </div>
  );
}
