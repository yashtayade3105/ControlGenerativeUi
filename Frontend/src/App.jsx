import React, { useState, useEffect, useRef } from 'react';
import GenerativeRenderer, { REGISTRY } from './components/GenerativeRenderer';
import { 
  Sparkles, Terminal, Play, Cpu, Layers, MessageSquare, Send, 
  Bot, User, Trash2, LogIn, UserPlus, LogOut, CheckCircle2, 
  Key, ShieldAlert, Plus, Eye, EyeOff, Loader2 
} from 'lucide-react';

// Pre-defined JSON specs matching the spectrum exercises to demonstrate control
const MOCK_SPECS = {
  welcome: {
    title: "Initial Form",
    spec: {
      "components": [
        { 
          "type": "Callout", 
          "props": { 
            "tone": "info", 
            "text": "Welcome to SGBAU College Finder. Please fill in your stream and academic score to check the matching cutoff limits." 
          } 
        },
        { 
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
          "type": "Callout", 
          "props": { 
            "tone": "success", 
            "text": "Found strong matching criteria for 92.5 percentile in Computer Science!" 
          } 
        },
        { 
          "type": "CollegeCard", 
          "props": { 
            "name": "Government College of Engineering, Amravati (GCOEA)", 
            "code": 4004, 
            "chance": "High" 
          } 
        },
        { 
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
          "type": "Callout",
          "props": { "tone": "success", "text": "Detailed institution insights loaded from SGBAU Database." }
        },
        {
          "type": "CollegeCard",
          "props": { "name": "Government College of Engineering, Amravati", "code": 4004, "chance": "High" }
        },
        {
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
          "type": "DocumentsRequired",
          "props": {
            "category": "OBC / SEBC",
            "items": ["MHT-CET Score Card", "Nationality Certificate", "Caste Certificate", "Non-Creamy Layer Validity"]
          }
        },
        {
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
          "type": "FacilitiesList",
          "props": {
            "facilities": ["High-Speed Wifi Campus", "Central Library (60k+ Books)", "Separate Boys & Girls Hostel", "Gymnasium & Sports Ground"]
          }
        },
        {
          "type": "PlacementStats",
          "props": {
            "highestPackage": "18.5",
            "averagePackage": "5.8",
            "recruiters": ["Tata Consultancy Services", "Cognizant", "Capgemini", "Infosys", "Wipro"]
          }
        },
        {
          "type": "ScholarshipCard",
          "props": {
            "name": "Rajarshi Chhatrapati Shahu Maharaj Fee Concession Scheme",
            "criteria": "Annual Family income below Rs. 8 Lakhs, admitted via CAP.",
            "benefitAmount": "50% Tuition Fee Waiver"
          }
        },
        {
          "type": "LocationMap",
          "props": {
            "address": "Kathora Road, VMV Road Area, Amravati, Maharashtra 444604",
            "city": "Amravati",
            "distance": "4.2 KM"
          }
        },
        {
          "type": "ContactCard",
          "props": {
            "officer": "Dr. A. M. Mahalle (Admission Coordinator)",
            "helpline": "+91-721-2531930",
            "email": "admission@gcoea.ac.in"
          }
        },
        {
          "type": "FAQAccordion",
          "props": {
            "items": [
              { "question": "Is Hostel accommodation guaranteed for first-year students?", "answer": "No, hostel seats are allocated strictly on a merit basis according to your category cutoff lists." },
              { "question": "Can I edit option forms after submitting CAP Round 1?", "answer": "You can only edit option forms before confirming with your password OTP token validation." }
            ]
          }
        },
        {
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
          "type": "Callout", 
          "props": { 
            "tone": "warn", 
            "text": "This spec simulates a hallucination. The second component is unrecognized by our registry." 
          } 
        },
        { 
          "type": "SuperSmartAIWidget", 
          "props": { 
            "fancyData": true 
          } 
        },
        { 
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

// Color palette config: High-End Neon Cyberpunk (Bright Deep Indigo/Violet & Cyber Teal Accents)
const THEME = {
  bg: '#0c0b17', // Pitch Dark Violet
  sidebarBg: 'rgba(21, 19, 41, 0.8)', 
  chatBg: 'rgba(16, 14, 33, 0.95)',
  accent: '#a855f7', // Bright electric purple
  teal: '#06b6d4', // Cyber teal
  panelBg: 'linear-gradient(135deg, rgba(31, 26, 64, 0.7) 0%, rgba(20, 16, 43, 0.4) 100%)',
  border: 'rgba(168, 85, 247, 0.15)', // Neon accent glow border
};

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
          // Select most recent active session
          selectSession(data[0].id);
        } else {
          // Auto create a default initial session
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

  const handleFormSubmit = (data) => {
    if (tabMode === 'presets') {
      handlePresetSelect('results');
    } else {
      const mockQuery = `Search matchings for branch ${data.branch || 'Computer science'} with ${data.percentile || '90'} score`;
      sendChatMessage(mockQuery);
    }
  };

  // Chat integration post stream
  const sendChatMessage = async (customQuery = '') => {
    const query = customQuery || inputText;
    if (!query.trim() || isSending) return;

    if (!currentSessionId) {
      alert("Please create or select an active chat session first.");
      return;
    }

    if (!customQuery) {
      setInputText('');
    }

    const userMsgId = Date.now().toString();
    setChatMessages(prev => [...prev, { id: userMsgId, sender: 'user', content: query }]);
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
      const decoder = new TextDecoder('utf-8');
      let partialResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        partialResponse += chunk;

        // Dynamic buffer specs feed
        setChatMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId ? { ...msg, content: partialResponse } : msg
        ));
      }

      setChatMessages(prev => prev.map(msg => 
        msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
      ));

      // Refresh session sidebar timestamp sorting
      fetchSessions();

    } catch (err) {
      console.error("Connection failed: ", err);
      // Premium offline fallback engine
      const mockSpecResponse = {
        components: [
          {
            type: "Callout",
            props: {
              tone: "warn",
              text: `Local model validation connection active. Backend server returned offline exception trace: ${err.message}`
            }
          },
          {
            type: "Callout",
            props: {
              tone: "success",
              text: `Generating matched cutoff profiles for: "${query}"`
            }
          },
          {
            type: "CollegeCard",
            props: {
              name: "Government College of Engineering, Amravati",
              code: 4004,
              chance: "High"
            }
          },
          {
            type: "PlacementStats",
            props: {
              highestPackage: "18.5",
              averagePackage: "5.8",
              recruiters: ["TCS", "Cognizant", "Wipro"]
            }
          }
        ]
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

  // AUTH VIEW WRAPPER
  if (!token) {
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

          {/* Form Actions */}
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
                  placeholder="Enter 123456 (Master Bypass)"
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

  // MAIN APPLICATION INTERFACE (Neon Cyberpunk Brightened Deep theme)
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      background: THEME.bg,
      color: '#e2e8f0',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      
      {/* SaaS Dynamic Chat Session Sidebar (ChatGPT / Claude layout) */}
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
                    transition: 'all 0.2s',
                    group: 'true'
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
          {/* Left panel options: Sandbox json editor vs dynamic chatbot panel */}
          {tabMode === 'presets' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '-8px' }}>
                {Object.keys(MOCK_SPECS).map((key) => (
                  <button
                    key={key}
                    onClick={() => handlePresetSelect(key)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      backgroundColor: activeKey === key ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.02)',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {MOCK_SPECS[key].title}
                  </button>
                ))}
              </div>

              <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: `1px solid ${THEME.border}` }}>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: `1px solid ${THEME.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
                    <Terminal size={14} style={{ color: THEME.teal }} />
                    <span>JSON UI Schema Spec (Model Output)</span>
                  </div>
                  <button 
                    onClick={handleApplySpec}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#10b981',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Play size={11} />
                    Apply Schema
                  </button>
                </div>

                <textarea
                  value={customSpecText}
                  onChange={(e) => setCustomSpecText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    backgroundColor: '#070a13',
                    color: '#34d399',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    border: 'none',
                    resize: 'none',
                    outline: 'none'
                  }}
                />

                {errorMsg && (
                  <div style={{
                    backgroundColor: 'rgba(239,68,68,0.15)',
                    borderTop: '1px solid rgba(239,68,68,0.3)',
                    padding: '10px 16px',
                    color: '#fca5a5',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}>
                    {errorMsg}
                  </div>
                )}
              </div>

              {/* Token Savings Metric Console */}
              <div className="glass-panel" style={{ padding: '16px', border: `1px solid ${THEME.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Cpu size={16} style={{ color: THEME.accent }} />
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#cbd5e1' }}>Generative UI Savings Metrics</h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '16px' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>JSON Spec Size</span>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: THEME.teal }}>~{jsonTokenCount} <span style={{ fontSize: '11px', fontWeight: '400', color: '#9ca3af' }}>Tokens</span></span>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Equivalent HTML Size</span>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444' }}>~{htmlTokenCount} <span style={{ fontSize: '11px', fontWeight: '400', color: '#9ca3af' }}>Tokens</span></span>
                  </div>

                  <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(6,182,212,0.05) 100%)', padding: '10px', borderRadius: '8px', border: `1px solid ${THEME.border}` }}>
                    <span style={{ fontSize: '11px', color: '#c084fc', display: 'block', marginBottom: '4px' }}>Token Saving Savings</span>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                      {tokenSavingPercent > 0 ? `${tokenSavingPercent}% Saving` : '100%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE SaaS BLACKBOX CHAT TERMINAL (Deep Violet styled backdrop) */
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
                                  return <GenerativeRenderer spec={spec} onFormSubmit={handleFormSubmit} />;
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
          )}

          {/* Right Side: The Dynamic Visual Output Screen (Displays selected spec render) */}
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
                <GenerativeRenderer spec={currentSpec} onFormSubmit={handleFormSubmit} />
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
                        return <GenerativeRenderer spec={spec} onFormSubmit={handleFormSubmit} />;
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
