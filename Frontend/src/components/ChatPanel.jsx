import React from 'react';
import { MessageSquare, Bot, User, Send } from 'lucide-react';
import GenerativeRenderer from './GenerativeRenderer';
import { THEME } from './Theme';

export default function ChatPanel({
  chatMessages,
  inputText,
  setInputText,
  sendChatMessage,
  isSending,
  currentSessionId,
  handleFormSubmit,
  onAction,
  chatEndRef
}) {
  return (
    <div className="glass-panel" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      overflow: 'hidden', 
      border: `1px solid ${THEME.border}`,
      backgroundColor: THEME.chatBg
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${THEME.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#fff' }}>
          <MessageSquare size={14} style={{ color: THEME.teal }} />
          <span>AI Admission Assistant (Real-Time Session)</span>
        </div>
      </div>

      {/* Chat Thread */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {chatMessages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
            <Bot size={36} style={{ color: THEME.accent, margin: '0 auto 12px auto', opacity: 0.6 }} />
            <h4 style={{ margin: '0 0 6px 0', color: '#fff', fontSize: '15px' }}>Start Conversation</h4>
            <p style={{ margin: 0, fontSize: '13px' }}>Enter query details to trigger dynamic specs.</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  gap: '10px',
                  flexDirection: isUser ? 'row-reverse' : 'row'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: isUser ? THEME.accent : THEME.teal,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0,
                  boxShadow: `0 0 8px ${isUser ? THEME.accent : THEME.teal}44`
                }}>
                  {isUser ? <User size={13} /> : <Bot size={13} />}
                </div>

                <div style={{
                  padding: isUser ? '10px 14px' : '0px',
                  borderRadius: '12px',
                  backgroundColor: isUser ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                  border: isUser ? `1px solid rgba(168, 85, 247, 0.25)` : 'none',
                  color: isUser ? '#cbd5e1' : 'inherit',
                  fontSize: '13.5px',
                  lineHeight: '1.5'
                }}>
                  {isUser ? (
                    <span>{msg.content}</span>
                  ) : (
                    <div style={{ minWidth: '320px' }}>
                      {(() => {
                        try {
                          const spec = JSON.parse(msg.content);
                          return <GenerativeRenderer spec={spec} onFormSubmit={handleFormSubmit} onAction={onAction} />;
                        } catch (e) {
                          return (
                            <div style={{
                              padding: '12px 16px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              fontFamily: 'monospace',
                              fontSize: '11px',
                              color: '#9ca3af'
                            }}>
                              {msg.isStreaming ? 'Streaming dynamic schema spec...' : msg.content || '...'}
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {isSending && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: THEME.teal,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Bot size={13} />
            </div>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>AI matching active data structures...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Send Area */}
      <div style={{
        padding: '16px',
        borderTop: `1px solid ${THEME.border}`,
        backgroundColor: 'rgba(0,0,0,0.2)',
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
          placeholder="Ask e.g. 'fees list of GCOEA' or 'timetable of rounds'..."
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            color: '#ffffff',
            outline: 'none',
            fontSize: '13.5px'
          }}
        />
        <button
          onClick={() => sendChatMessage()}
          disabled={isSending}
          style={{
            padding: '0 20px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: THEME.accent,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontWeight: '600',
            transition: 'background 0.2s',
            boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#9333ea'}
          onMouseLeave={(e) => e.target.style.backgroundColor = THEME.accent}
        >
          <Send size={13} />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
