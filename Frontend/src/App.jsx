import React, { useState, useEffect, useRef } from 'react';
import GenerativeRenderer from './components/GenerativeRenderer';
import AuthView from './components/AuthView';
import Sidebar from './components/Sidebar';
import PresetsPanel from './components/PresetsPanel';
import ChatPanel from './components/ChatPanel';
import { Sparkles, Terminal, Layers, MessageSquare } from 'lucide-react';
import { THEME } from './components/Theme';

// Pre-defined JSON specs matching the spectrum exercises to demonstrate control
const MOCK_SPECS = {
  welcome: {
    title: "Initial Form",
    spec: {
      "components": [
        { 
          "id": "cmp_001",
          "type": "Callout", 
          "props": { 
            "tone": "info", 
            "text": "Welcome to SGBAU College Finder. Please fill in your stream and academic score to check the matching cutoff limits." 
          } 
        },
        { 
          "id": "cmp_002",
          "type": "BranchForm", 
          "props": { 
            "title": "SGBAU Entrance Criteria", 
            "fields": [
              { "name": "branch", "label": "Engineering Branch Preferred (e.g. CS, IT, EXTC)", "kind": "text" },
              { "name": "percentile", "label": "MHT-CET Percentile Score", "kind": "number" }
            ] 
          } 
        }
      ]
    }
  },
  results: {
    title: "Filtered College Recommendations",
    spec: {
      "components": [
        { 
          "id": "cmp_001",
          "type": "Callout", 
          "props": { 
            "tone": "success", 
            "text": "Found strong matching criteria for 92.5 percentile in Computer Science!" 
          } 
        },
        { 
          "id": "cmp_002",
          "type": "CollegeCard", 
          "props": { 
            "name": "Government College of Engineering, Amravati (GCOEA)", 
            "code": 4004, 
            "chance": "High" 
          } 
        },
        { 
          "id": "cmp_003",
          "type": "CutoffTable", 
          "props": { 
            "rows": [
              { "year": 2025, "round": 1, "cutoff": 91.2 },
              { "year": 2024, "round": 1, "cutoff": 90.8 },
              { "year": 2023, "round": 2, "cutoff": 89.9 }
            ] 
          } 
        },
        { 
          "id": "cmp_004",
          "type": "CollegeCard", 
          "props": { 
            "name": "Prof. Ram Meghe Institute of Technology & Research, Badnera", 
            "code": 4104, 
            "chance": "High" 
          } 
        }
      ]
    }
  },
  campus_profile: {
    title: "Full Campus Profile Spec (10+ Components)",
    spec: {
      "components": [
        {
          "id": "cmp_001",
          "type": "Callout",
          "props": { "tone": "success", "text": "Detailed institution insights loaded from SGBAU Database." }
        },
        {
          "id": "cmp_002",
          "type": "CollegeCard",
          "props": { "name": "Government College of Engineering, Amravati", "code": 4004, "chance": "High" }
        },
        {
          "id": "cmp_003",
          "type": "AdmissionTimeline",
          "props": {
            "events": [
              { "date": "Aug 02, 2026", "title": "Online Registration & Verification Ends" },
              { "date": "Aug 06, 2026", "title": "Display of Provisional Merit List" },
              { "date": "Aug 12, 2026", "title": "CAP Round I Allocation" }
            ]
          }
        },
        {
          "id": "cmp_004",
          "type": "DocumentsRequired",
          "props": {
            "category": "OBC / SEBC",
            "items": ["MHT-CET Score Card", "Nationality Certificate", "Caste Certificate", "Non-Creamy Layer Validity"]
          }
        },
        {
          "id": "cmp_005",
          "type": "FeeStructure",
          "props": {
            "totalFee": "84,500",
            "categoryBreakdown": [
              { "category": "Open Category (General)", "fee": "84,500" },
              { "category": "OBC Candidates (50% Concession)", "fee": "42,250" },
              { "category": "SC / ST Candidates (100% Concession)", "fee": "3,400" }
            ]
          }
        },
        {
          "id": "cmp_006",
          "type": "FacilitiesList",
          "props": {
            "facilities": ["High-Speed Wifi Campus", "Central Library (60k+ Books)", "Separate Boys & Girls Hostel", "Gymnasium & Sports Ground"]
          }
        },
        {
          "id": "cmp_007",
          "type": "PlacementStats",
          "props": {
            "highestPackage": "18.5",
            "averagePackage": "5.8",
            "recruiters": ["Tata Consultancy Services", "Cognizant", "Capgemini", "Infosys", "Wipro"]
          }
        },
        {
          "id": "cmp_008",
          "type": "ScholarshipCard",
          "props": {
            "name": "Rajarshi Chhatrapati Shahu Maharaj Fee Concession Scheme",
            "criteria": "Annual Family income below Rs. 8 Lakhs, admitted via CAP.",
            "benefitAmount": "50% Tuition Fee Waiver"
          }
        },
        {
          "id": "cmp_009",
          "type": "LocationMap",
          "props": {
            "address": "Kathora Road, VMV Road Area, Amravati, Maharashtra 444604",
            "city": "Amravati",
            "distance": "4.2 KM"
          }
        },
        {
          "id": "cmp_010",
          "type": "ContactCard",
          "props": {
            "officer": "Dr. A. M. Mahalle (Admission Coordinator)",
            "helpline": "+91-721-2531930",
            "email": "admission@gcoea.ac.in"
          }
        },
        {
          "id": "cmp_011",
          "type": "FAQAccordion",
          "props": {
            "items": [
              { "question": "Is Hostel accommodation guaranteed for first-year students?", "answer": "No, hostel seats are allocated strictly on a merit basis according to your category cutoff lists." },
              { "question": "Can I edit option forms after submitting CAP Round 1?", "answer": "You can only edit option forms before confirming with your password OTP token validation." }
            ]
          }
        },
        {
          "id": "cmp_012",
          "type": "UserReview",
          "props": {
            "studentName": "Siddharth Deshmukh",
            "year": "2025",
            "rating": 5,
            "reviewText": "Awesome faculty guidance, excellent laboratory infrastructures, and GCOEA coding culture is really premium."
          }
        }
      ]
    }
  },
  bad_spec: {
    title: "Corrupted/Hallucinated Component Spec (Fallback Test)",
    spec: {
      "components": [
        { 
          "id": "cmp_001",
          "type": "Callout", 
          "props": { 
            "tone": "warn", 
            "text": "This spec simulates a hallucination. The second component is unrecognized by our registry." 
          } 
        },
        { 
          "id": "cmp_002",
          "type": "SuperSmartAIWidget", 
          "props": { 
            "fancyData": true 
          } 
        },
        { 
          "id": "cmp_003",
          "type": "Callout", 
          "props": { 
            "tone": "success", 
            "text": "The page successfully loaded without throwing exceptions! The unknown component degraded gracefully." 
          } 
        }
      ]
    }
  }
};

function estimateTokens(str) {
  return Math.ceil(str.length / 4);
}

const EQUIVALENT_HTML_RESULTS = `
<div class="callout success">Found strong matching criteria for 92.5 percentile in CS!</div>
<div class="card">
  <h3>Government College of Engineering, Amravati</h3>
  <p>Code: 4004 - High Chance</p>
</div>
`;

export default function App() {
  // Authentication states
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [authMode, setAuthMode] = useState('login'); // login, signup_otp, signup_register
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Tab mode state: "presets" or "chat"
  const [tabMode, setTabMode] = useState('chat');

  // Simulator specifications state
  const [activeKey, setActiveKey] = useState('welcome');
  const [customSpecText, setCustomSpecText] = useState(JSON.stringify(MOCK_SPECS.welcome.spec, null, 2));
  const [currentSpec, setCurrentSpec] = useState(MOCK_SPECS.welcome.spec);
  const [errorMsg, setErrorMsg] = useState('');

  // Sessions and real time Chat UI
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Auto scroll chat console
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSending]);

  // Load chat sessions once authenticated
  useEffect(() => {
    if (token) {
      fetchSessions();
    }
  }, [token]);

  const fetchSessions = async () => {
    setIsSessionsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0) {
          selectSession(data[0].id);
        } else {
          createNewSession();
        }
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (e) {
      console.error("Error loading chat sessions:", e);
    } finally {
      setIsSessionsLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const res = await fetch('http://localhost:8000/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: `Session ${sessions.length + 1}` })
      });
      if (res.ok) {
        const newSession = await res.json();
        setSessions(prev => [newSession, ...prev]);
        selectSession(newSession.id);
      }
    } catch (e) {
      console.error("Error creating session:", e);
    }
  };

  const selectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    try {
      const res = await fetch(`http://localhost:8000/chats/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages || []);
      }
    } catch (e) {
      console.error("Error loading session messages:", e);
    }
  };

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:8000/chats/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          setChatMessages([]);
          setCurrentSessionId('');
        }
      }
    } catch (e) {
      console.error("Error deleting session:", e);
    }
  };

  // Auth Operations
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsLoadingAuth(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', authEmail);
      formData.append('password', authPassword);

      const res = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setAuthPassword('');
      } else {
        setAuthError(data.detail || 'Authentication failed.');
      }
    } catch (err) {
      setAuthError('Connection to Auth API failed. Ensure Backend is running.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsLoadingAuth(true);
    try {
      const res = await fetch('http://localhost:8000/auth/signup/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setAuthSuccess(data.message || 'OTP verification code sent!');
        if (data.debug_otp) {
          setAuthOtp(data.debug_otp); // Auto bypass set for local dev environment
        }
        setAuthMode('signup_register');
      } else {
        setAuthError(data.detail || 'Failed to request OTP code.');
      }
    } catch (err) {
      setAuthError('Connection failed.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsLoadingAuth(true);
    try {
      // First verify OTP code
      const verifyRes = await fetch('http://localhost:8000/auth/signup/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, otp_code: authOtp })
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json();
        throw new Error(errData.detail || 'OTP verification failed.');
      }

      // Complete registration process
      const registerRes = await fetch('http://localhost:8000/auth/signup/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          full_name: authName,
          password: authPassword,
          otp_code: authOtp
        })
      });

      const regData = await registerRes.json();
      if (registerRes.ok) {
        setAuthSuccess('Registration successful! Please login.');
        setAuthMode('login');
        setAuthPassword('');
      } else {
        setAuthError(regData.detail || 'Failed to complete registration.');
      }
    } catch (err) {
      setAuthError(err.message || 'Verification connection failed.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setSessions([]);
    setChatMessages([]);
    setCurrentSessionId('');
  };

  // Simulator specific handlers
  const handlePresetSelect = (key) => {
    setActiveKey(key);
    const spec = MOCK_SPECS[key].spec;
    setCurrentSpec(spec);
    setCustomSpecText(JSON.stringify(spec, null, 2));
    setErrorMsg('');
  };

  const handleApplySpec = () => {
    try {
      const parsed = JSON.parse(customSpecText);
      setCurrentSpec(parsed);
      setErrorMsg('');
    } catch (e) {
      setErrorMsg(`JSON Parse Error: ${e.message}`);
    }
  };

  // Action-driven next turn handler (Interaction Loop)
  const handleFormSubmit = (data) => {
    if (tabMode === 'presets') {
      handlePresetSelect('results');
    } else {
      // Create a structured action input driving the next turn
      const modelMessage = `Form Submitted: BranchForm. Chosen Branch: ${data.branch || 'None'}. MHT-CET Score: ${data.percentile || 'None'}. Find cutoffs and recommendations for this combination.`;
      const humanLabel = `Submitted entrance criteria: ${data.branch} - ${data.percentile}%ile`;
      sendChatMessage(modelMessage, humanLabel);
    }
  };

  const handleAction = (actionData) => {
    // Displays the friendly humanLabel in the chat, sends modelMessage to model
    sendChatMessage(actionData.modelMessage, actionData.humanLabel);
  };

  // Chat message sending with non-streaming FastAPI handler
  const sendChatMessage = async (customQuery = '', displayQuery = '') => {
    const query = customQuery || inputText;
    const chatDisplay = displayQuery || query;
    if (!query.trim() || isSending) return;

    if (!currentSessionId) {
      alert("Please create or select an active chat session first.");
      return;
    }

    if (!customQuery) {
      setInputText('');
    }

    const userMsgId = Date.now().toString();
    setChatMessages(prev => [...prev, { id: userMsgId, sender: 'user', content: chatDisplay }]);
    setIsSending(true);

    const assistantMsgId = (Date.now() + 1).toString();
    setChatMessages(prev => [...prev, { id: assistantMsgId, sender: 'assistant', content: '', isStreaming: true }]);

    try {
      const response = await fetch(`http://localhost:8000/chats/${currentSessionId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: query })
      });

      if (!response.ok) {
        throw new Error(`HTTP Server Error: Status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let streamData = "";
      let parsedComponents = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        streamData += decoder.decode(value, { stream: true });
        const lines = streamData.split('\n');
        streamData = lines.pop(); // Keep the last incomplete chunk in buffer

        let updated = false;
        for (const line of lines) {
          if (line.trim()) {
            try {
              const comp = JSON.parse(line);
              parsedComponents.push(comp);
              updated = true;
            } catch (e) {
              console.error("Partial JSON parse error:", e);
            }
          }
        }

        if (updated) {
          const progressiveSpec = {
            version: "1.0",
            intent: "streaming_response",
            confidence: 1.0,
            components: [...parsedComponents]
          };
          setChatMessages(prev => prev.map(msg => 
            msg.id === assistantMsgId ? { ...msg, content: JSON.stringify(progressiveSpec), isStreaming: true } : msg
          ));
        }
      }

      if (streamData.trim()) {
        try {
          parsedComponents.push(JSON.parse(streamData));
        } catch (e) {}
      }

      const finalSpec = {
        version: "1.0",
        intent: "streaming_response",
        confidence: 1.0,
        components: parsedComponents
      };

      setChatMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId ? { ...msg, content: JSON.stringify(finalSpec), isStreaming: false } : msg
      ));

      fetchSessions();

    } catch (err) {
      console.error("Connection failed: ", err);
      // Premium offline fallback engine
      const mockSpecResponse = {
        version: "1.0",
        intent: "offline_fallback",
        confidence: 1.0,
        components: [
          {
            id: "cmp_err_001",
            type: "Callout",
            props: {
              tone: "warn",
              text: `Local matching active. Backend exception: ${err.message}`
            }
          },
          {
            id: "cmp_err_002",
            type: "Callout",
            props: {
              tone: "success",
              text: `Simulating search results for your query: "${query}"`
            }
          },
          {
            id: "cmp_err_003",
            type: "CollegeCard",
            props: {
              name: "Government College of Engineering, Amravati",
              code: 4004,
              chance: "High"
            }
          },
          {
            id: "cmp_err_004",
            type: "PlacementStats",
            props: {
              highestPackage: "18.5",
              averagePackage: "5.8",
              recruiters: ["TCS", "Cognizant", "Wipro"]
            }
          }
        ],
        sources: [{"type": "system", "name": "offline_simulator"}]
      };

      setChatMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId ? { ...msg, content: JSON.stringify(mockSpecResponse, null, 2), isStreaming: false } : msg
      ));
    } finally {
      setIsSending(false);
    }
  };

  const jsonTokenCount = estimateTokens(JSON.stringify(currentSpec, null, 2));
  const htmlTokenCount = estimateTokens(EQUIVALENT_HTML_RESULTS);
  const tokenSavingPercent = Math.round(((htmlTokenCount - jsonTokenCount) / htmlTokenCount) * 100);

  // AUTHENTICATION GUARD WRAPPER
  if (!token) {
    return (
      <AuthView
        authMode={authMode}
        setAuthMode={setAuthMode}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authName={authName}
        setAuthName={setAuthName}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authOtp={authOtp}
        setAuthOtp={setAuthOtp}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        authError={authError}
        setAuthError={setAuthError}
        authSuccess={authSuccess}
        isLoadingAuth={isLoadingAuth}
        handleLogin={handleLogin}
        handleRequestOtp={handleRequestOtp}
        handleRegister={handleRegister}
      />
    );
  }

  // MAIN APPLICATION DASHBOARD
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      background: THEME.bg,
      color: '#e2e8f0',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      
      {/* SaaS Dynamic Chat Session Sidebar */}
      <Sidebar
        sessions={sessions}
        isSessionsLoading={isSessionsLoading}
        currentSessionId={currentSessionId}
        createNewSession={createNewSession}
        selectSession={selectSession}
        deleteSession={deleteSession}
        handleLogout={handleLogout}
      />

      {/* Workspace Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header toolbar */}
        <header style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${THEME.border}`,
          background: 'rgba(12, 11, 23, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
              padding: '8px',
              borderRadius: '10px',
              color: '#fff',
              display: 'flex',
              boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', letterSpacing: '-0.025em', color: '#fff' }}>
                SGBAU Nexus <span style={{ color: THEME.teal }}>Generative UI Engine</span>
              </h1>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Controlled Component Catalog Pattern</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => setTabMode('chat')}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                backgroundColor: tabMode === 'chat' ? THEME.accent : 'transparent',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: tabMode === 'chat' ? '0 0 10px rgba(168, 85, 247, 0.4)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <MessageSquare size={13} />
              <span>Blackbox Chat UI</span>
            </button>
            <button
              onClick={() => setTabMode('presets')}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                backgroundColor: tabMode === 'presets' ? THEME.accent : 'transparent',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: tabMode === 'presets' ? '0 0 10px rgba(168, 85, 247, 0.4)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Terminal size={13} />
              <span>Schema Presets Playground</span>
            </button>
          </div>
        </header>

        {/* Dynamic Panels split grids */}
        <main style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          gap: '24px',
          padding: '24px',
          maxHeight: 'calc(100vh - 73px)',
          boxSizing: 'border-box'
        }}>
          {/* Left Panel: Presets vs Chat */}
          {tabMode === 'presets' ? (
            <PresetsPanel
              MOCK_SPECS={MOCK_SPECS}
              activeKey={activeKey}
              handlePresetSelect={handlePresetSelect}
              customSpecText={customSpecText}
              setCustomSpecText={setCustomSpecText}
              handleApplySpec={handleApplySpec}
              errorMsg={errorMsg}
              jsonTokenCount={jsonTokenCount}
              htmlTokenCount={htmlTokenCount}
              tokenSavingPercent={tokenSavingPercent}
            />
          ) : (
            <ChatPanel
              chatMessages={chatMessages}
              inputText={inputText}
              setInputText={setInputText}
              sendChatMessage={sendChatMessage}
              isSending={isSending}
              currentSessionId={currentSessionId}
              handleFormSubmit={handleFormSubmit}
              onAction={handleAction}
              chatEndRef={chatEndRef}
            />
          )}

          {/* Right Side: The Dynamic Visual Output Screen */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', border: `1px solid ${THEME.border}` }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${THEME.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(0,0,0,0.1)'
            }}>
              <Layers size={14} style={{ color: THEME.teal }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Dynamic Render Engine (Visual UI)</span>
            </div>

            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              {tabMode === 'presets' ? (
                <GenerativeRenderer spec={currentSpec} onFormSubmit={handleFormSubmit} onAction={handleAction} />
              ) : (
                <div>
                  <div style={{ marginBottom: '16px', fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                    Showing active layout stream from the AI chat console history.
                  </div>
                  {(() => {
                    const assistantMsgs = chatMessages.filter(m => m.sender === 'assistant');
                    if (assistantMsgs.length > 0) {
                      const lastMsg = assistantMsgs[assistantMsgs.length - 1];
                      try {
                        const spec = JSON.parse(lastMsg.content);
                        return <GenerativeRenderer spec={spec} onFormSubmit={handleFormSubmit} onAction={handleAction} />;
                      } catch (e) {
                        return (
                          <div style={{
                            padding: '20px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255,255,255,0.01)',
                            border: '1px dashed rgba(255,255,255,0.1)',
                            color: '#9ca3af',
                            textAlign: 'center'
                          }}>
                            {lastMsg.isStreaming ? 'Streaming AI layout spec...' : 'AI model response parsed as text, no dynamic components specification in payload.'}
                          </div>
                        );
                      }
                    }
                    return <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '13px' }}>No active layout streams yet. Write in chat to see dynamic components render here!</div>;
                  })()}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
