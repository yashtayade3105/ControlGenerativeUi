import React from 'react';
import { Plus, MessageSquare, Trash2, LogOut, Loader2 } from 'lucide-react';
import { THEME } from './Theme';

export default function Sidebar({
  sessions,
  isSessionsLoading,
  currentSessionId,
  createNewSession,
  selectSession,
  deleteSession,
  handleLogout
}) {
  return (
    <aside style={{
      width: '260px',
      backgroundColor: THEME.sidebarBg,
      borderRight: `1px solid ${THEME.border}`,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      {/* User profile actions */}
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${THEME.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '12px',
            fontWeight: '700'
          }}>
            N
          </div>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Nexus Portal</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Log Out"
          style={{
            padding: '6px',
            borderRadius: '6px',
            border: 'none',
            background: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            display: 'flex',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Start New Chat session button */}
      <div style={{ padding: '12px' }}>
        <button
          onClick={createNewSession}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: `1px dashed ${THEME.border}`,
            backgroundColor: 'rgba(168, 85, 247, 0.05)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.15)';
            e.currentTarget.style.borderColor = THEME.accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.05)';
            e.currentTarget.style.borderColor = THEME.border;
          }}
        >
          <Plus size={14} style={{ color: THEME.teal }} />
          <span>New Chat session</span>
        </button>
      </div>

      {/* Session history listings */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {isSessionsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: '#9ca3af' }}>
            <Loader2 size={16} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
            <span>Loading chat history...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: '#9ca3af' }}>
            No chats recorded.
          </div>
        ) : (
          sessions.map((s) => {
            const isActive = s.id === currentSessionId;
            return (
              <div
                key={s.id}
                onClick={() => selectSession(s.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.01)',
                  border: isActive ? `1px solid rgba(168, 85, 247, 0.3)` : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <MessageSquare size={13} style={{ color: isActive ? THEME.teal : '#9ca3af', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: '500', color: isActive ? '#fff' : '#cbd5e1', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {s.title}
                  </span>
                </div>

                <button
                  onClick={(e) => deleteSession(s.id, e)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
