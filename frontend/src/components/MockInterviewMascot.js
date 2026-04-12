import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X, Send, Mic, MicOff, ChevronDown, Star, Award, TrendingUp,
  MessageCircle, BarChart2, RefreshCw, Settings, Sparkles, Bot,
  Briefcase, Building2, Target, CheckCircle, AlertCircle,
  Video, VideoOff, Volume2, VolumeX, Maximize2, Minimize2,
  Camera, Type, Phone, PhoneOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './MockInterviewMascot.css';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

// ═══ Speech Recognition Setup ═══
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// ─── Interview Setup Panel ───
function InterviewSetup({ onStart, loading }) {
  const [position, setPosition] = useState('Software Developer');
  const [company, setCompany] = useState('');
  const [mode, setMode] = useState('friendly');
  const [numQ, setNumQ] = useState(3);
  const [interviewType, setInterviewType] = useState('video'); // text, voice, video

  const popularRoles = [
    'Software Developer', 'Data Analyst', 'Web Developer',
    'ML Engineer', 'DevOps Engineer', 'Quality Analyst',
    'Business Analyst', 'Embedded Systems Engineer'
  ];

  return (
    <div className="mi-setup">
      <div className="mi-setup-header">
        <div className="mi-setup-icon-wrap">
          <Sparkles size={24} />
        </div>
        <h3>AI Mock Interview</h3>
        <p>Practice with our AI interviewer — Text, Voice, or Video!</p>
      </div>

      <div className="mi-setup-form">
        {/* Interview Type Selector */}
        <label className="mi-label">
          <Camera size={14} />
          <span>Interview Mode</span>
        </label>
        <div className="mi-type-selector">
          {[
            { value: 'text', icon: Type, label: 'Text', desc: 'Type answers', color: '#6C63FF' },
            { value: 'voice', icon: Mic, label: 'Voice', desc: 'Speak answers', color: '#4CAF50' },
            { value: 'video', icon: Video, label: 'Video', desc: 'Camera + Voice', color: '#FF6B35' },
          ].map((t) => (
            <button
              key={t.value}
              className={`mi-type-btn ${interviewType === t.value ? 'mi-type-active' : ''}`}
              onClick={() => setInterviewType(t.value)}
              style={interviewType === t.value ? { borderColor: t.color, background: `${t.color}12` } : {}}
            >
              <t.icon size={20} style={{ color: interviewType === t.value ? t.color : 'inherit' }} />
              <span className="mi-type-label">{t.label}</span>
              <span className="mi-type-desc">{t.desc}</span>
            </button>
          ))}
        </div>

        <label className="mi-label" style={{ marginTop: '14px' }}>
          <Briefcase size={14} />
          <span>Position / Role</span>
        </label>
        <input
          className="mi-input"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="e.g., Software Developer"
        />
        <div className="mi-quick-tags">
          {popularRoles.map((role) => (
            <button
              key={role}
              className={`mi-tag ${position === role ? 'mi-tag-active' : ''}`}
              onClick={() => setPosition(role)}
            >
              {role}
            </button>
          ))}
        </div>

        <label className="mi-label" style={{ marginTop: '12px' }}>
          <Building2 size={14} />
          <span>Company Name (optional)</span>
        </label>
        <input
          className="mi-input"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g., Infosys, TCS, Google"
        />

        <label className="mi-label" style={{ marginTop: '12px' }}>
          <Settings size={14} />
          <span>Interview Style</span>
        </label>
        <div className="mi-mode-selector">
          {[
            { value: 'friendly', label: '😊 Friendly', desc: 'Relaxed & encouraging' },
            { value: 'formal', label: '👔 Formal', desc: 'Professional tone' },
            { value: 'technical', label: '🔧 Technical', desc: 'Deep & rigorous' },
          ].map((m) => (
            <button
              key={m.value}
              className={`mi-mode-btn ${mode === m.value ? 'mi-mode-active' : ''}`}
              onClick={() => setMode(m.value)}
            >
              <span className="mi-mode-label">{m.label}</span>
              <span className="mi-mode-desc">{m.desc}</span>
            </button>
          ))}
        </div>

        <label className="mi-label" style={{ marginTop: '12px' }}>
          <Target size={14} />
          <span>Number of Questions: {numQ}</span>
        </label>
        <input
          type="range"
          min="2"
          max="8"
          value={numQ}
          onChange={(e) => setNumQ(parseInt(e.target.value))}
          className="mi-range"
        />
        <div className="mi-range-labels">
          <span>Quick (2)</span>
          <span>Full (8)</span>
        </div>
      </div>

      <button
        className="mi-start-btn"
        onClick={() => onStart({
          position,
          company_name: company || 'Tech Company',
          mode,
          num_of_q: numQ,
          num_of_follow_up: 1,
          interviewType,
        })}
        disabled={loading || !position.trim()}
      >
        {loading ? (
          <><RefreshCw size={18} className="mi-spin" /> Starting Interview...</>
        ) : (
          <><Sparkles size={18} /> Start {interviewType === 'video' ? 'Video' : interviewType === 'voice' ? 'Voice' : 'Text'} Interview</>
        )}
      </button>
    </div>
  );
}

// ─── Score Ring ───
function ScoreRing({ score, size = 80, label, color }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="mi-score-ring">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color || 'var(--sk-accent)'} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1.5s ease' }}
        />
      </svg>
      <div className="mi-score-ring-value">{score}</div>
      {label && <div className="mi-score-ring-label">{label}</div>}
    </div>
  );
}

// ─── Evaluation Results ───
function EvaluationResults({ evaluation, onNewInterview, onClose }) {
  if (!evaluation) return null;

  const scoreColor = (score, max = 100) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return '#2E7D32';
    if (pct >= 60) return '#F57F17';
    return '#C62828';
  };

  return (
    <div className="mi-evaluation">
      <div className="mi-eval-header">
        <Award size={28} className="mi-eval-trophy" />
        <h3>Interview Complete!</h3>
        <p className="mi-eval-recommendation">{evaluation.recommendation}</p>
      </div>

      <div className="mi-eval-scores">
        <ScoreRing score={evaluation.overall_score} size={100} label="Overall" color={scoreColor(evaluation.overall_score)} />
        <div className="mi-eval-sub-scores">
          <div className="mi-sub-score">
            <MessageCircle size={16} />
            <span>Communication</span>
            <strong style={{ color: scoreColor(evaluation.communication_score, 10) }}>
              {evaluation.communication_score}/10
            </strong>
          </div>
          <div className="mi-sub-score">
            <BarChart2 size={16} />
            <span>Technical</span>
            <strong style={{ color: scoreColor(evaluation.technical_score, 10) }}>
              {evaluation.technical_score}/10
            </strong>
          </div>
          <div className="mi-sub-score">
            <TrendingUp size={16} />
            <span>Confidence</span>
            <strong style={{ color: scoreColor(evaluation.confidence_score, 10) }}>
              {evaluation.confidence_score}/10
            </strong>
          </div>
        </div>
      </div>

      <div className="mi-eval-summary">
        <p>{evaluation.summary}</p>
      </div>

      {evaluation.strengths?.length > 0 && (
        <div className="mi-eval-section">
          <h4><CheckCircle size={16} style={{ color: '#2E7D32' }} /> Strengths</h4>
          <ul>
            {evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {evaluation.improvements?.length > 0 && (
        <div className="mi-eval-section">
          <h4><AlertCircle size={16} style={{ color: '#E65100' }} /> Areas to Improve</h4>
          <ul>
            {evaluation.improvements.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}

      {evaluation.question_scores?.length > 0 && (
        <div className="mi-eval-section">
          <h4><Star size={16} style={{ color: '#F57F17' }} /> Question Breakdown</h4>
          {evaluation.question_scores.map((q, i) => (
            <div key={i} className="mi-q-score">
              <div className="mi-q-score-header">
                <span className="mi-q-num">Q{i + 1}</span>
                <span className="mi-q-score-value" style={{ color: scoreColor(q.score, 10) }}>
                  {q.score}/10
                </span>
              </div>
              <p className="mi-q-question">{q.question}</p>
              <p className="mi-q-feedback">{q.feedback}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mi-eval-actions">
        <button className="mi-start-btn" onClick={onNewInterview}>
          <RefreshCw size={16} /> Try Another Interview
        </button>
        <button className="mi-close-eval-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Chat Message Bubble ───
function ChatBubble({ role, content }) {
  const isInterviewer = role === 'interviewer';
  return (
    <div className={`mi-bubble ${isInterviewer ? 'mi-bubble-ai' : 'mi-bubble-user'}`}>
      {isInterviewer && (
        <div className="mi-bubble-avatar">
          <Bot size={16} />
        </div>
      )}
      <div className="mi-bubble-content">
        <div className="mi-bubble-text" dangerouslySetInnerHTML={{
          __html: content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>')
        }} />
      </div>
    </div>
  );
}

// ─── Audio Visualizer ───
function AudioVisualizer({ stream, isRecording }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    if (!stream || !isRecording || !canvasRef.current) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    analyserRef.current = analyser;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, '#6C63FF');
        gradient.addColorStop(1, '#4CAF50');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, 3);
        ctx.fill();
        x += barWidth;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      audioCtx.close();
    };
  }, [stream, isRecording]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={40}
      className="mi-audio-visualizer"
      style={{ opacity: isRecording ? 1 : 0.3 }}
    />
  );
}

// ─── AI Avatar (animated circle for interviewer) ───
function AIAvatar({ isSpeaking }) {
  return (
    <div className={`mi-ai-avatar ${isSpeaking ? 'mi-ai-speaking' : ''}`}>
      <div className="mi-ai-avatar-inner">
        <Bot size={40} />
      </div>
      <div className="mi-ai-avatar-ring mi-ai-ring-1" />
      <div className="mi-ai-avatar-ring mi-ai-ring-2" />
      <div className="mi-ai-avatar-ring mi-ai-ring-3" />
      <span className="mi-ai-avatar-label">Sankalp Buddy</span>
    </div>
  );
}

// ═══ Main Mascot Component ═══
export default function MockInterviewMascot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('setup'); // setup, interview, evaluation
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [pulseActive, setPulseActive] = useState(true);
  const [interviewType, setInterviewType] = useState('text');
  const [isExpanded, setIsExpanded] = useState(false);

  // Voice / Video State
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [micStream, setMicStream] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Pulse animation interval
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive((prev) => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);


  // Cleanup on unmount
  useEffect(() => {
    const currentSynth = synthRef.current;
    const currentMediaStream = mediaStreamRef.current;
    const currentVideo = videoRef.current;
    const currentRecognition = recognitionRef.current;

    return () => {
      if (currentMediaStream) {
        currentMediaStream.getTracks().forEach((track) => track.stop());
      }
      if (currentVideo) {
        currentVideo.srcObject = null;
      }
      if (currentRecognition) {
        currentRecognition.stop();
      }
      if (currentSynth) {
        currentSynth.cancel();
      }
    };
  }, []);

  // ═══ Camera / Video Functions ═══
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
      setMicStream(stream);
      return stream;
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access camera/microphone. Please allow permissions and try again.');
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setMicStream(null);
  }, []);

  const toggleCamera = useCallback(() => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [isCameraOn, startCamera, stopCamera]);

  // ═══ Voice Recognition Functions ═══
  const startRecognition = useCallback(async () => {
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    // Get mic stream for visualizer if not already available
    if (!micStream && interviewType === 'voice') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStream(stream);
        mediaStreamRef.current = stream;
      } catch (err) {
        console.error('Microphone access error:', err);
        alert('Please allow microphone access to use voice mode.');
        return;
      }
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim = transcript;
        }
      }
      setVoiceTranscript(finalTranscript + interim);
      setInputText(finalTranscript + interim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone permissions.');
      }
    };

    recognition.onend = () => {
      // Restart if still recording
      if (isRecording && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Already started
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [micStream, interviewType, isRecording]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);

    // Cleanup mic stream if in voice-only mode
    if (interviewType === 'voice' && mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
      setMicStream(null);
    }
  }, [interviewType]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecognition();
    } else {
      setVoiceTranscript('');
      setInputText('');
      startRecognition();
    }
  }, [isRecording, startRecognition, stopRecognition]);

  // ═══ Text-to-Speech ═══
  const speakText = useCallback((text) => {
    if (!ttsEnabled || !synthRef.current) return;

    // Cancel any current speech
    synthRef.current.cancel();

    // Clean text for speech (remove markdown, special chars)
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/[*_#`]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to get a good English voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find((v) =>
      v.name.includes('Google') && v.lang.startsWith('en')
    ) || voices.find((v) => v.lang.startsWith('en-'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, [ttsEnabled]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  // ═══ Interview Functions ═══
  const startInterview = async (config) => {
    setLoading(true);
    setInterviewType(config.interviewType || 'text');
    const shouldExpand = config.interviewType === 'video';
    setIsExpanded(shouldExpand);

    try {
      const response = await fetch(`${API_BASE_URL}/api/student/mock-interview/start`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: config.position,
          company_name: config.company_name,
          mode: config.mode,
          num_of_q: config.num_of_q,
          num_of_follow_up: config.num_of_follow_up,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.detail || 'Failed to start interview');
        return;
      }

      const data = await response.json();
      setSessionId(data.session_id);
      setMessages([{ role: 'interviewer', content: data.message }]);
      setView('interview');

      // Start camera for video mode
      if (config.interviewType === 'video') {
        setTimeout(() => startCamera(), 500);
      }

      // Speak the first message
      if (config.interviewType !== 'text') {
        setTimeout(() => speakText(data.message), 800);
      }
    } catch (err) {
      alert('Failed to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (overrideText) => {
    const textToSend = overrideText || inputText.trim();
    if (!textToSend || sendingMessage) return;

    setInputText('');
    setVoiceTranscript('');
    setMessages((prev) => [...prev, { role: 'candidate', content: textToSend }]);
    setSendingMessage(true);

    // Stop recording while waiting for response
    if (isRecording) {
      stopRecognition();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/student/mock-interview/message`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: textToSend }),
      });

      if (!response.ok) {
        const err = await response.json();
        setMessages((prev) => [...prev, { role: 'interviewer', content: `⚠️ Error: ${err.detail}` }]);
        return;
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'interviewer', content: data.message }]);

      // Speak the AI response
      if (interviewType !== 'text') {
        speakText(data.message);
      }

      if (data.is_ended) {
        stopCamera();
        stopRecognition();
        setTimeout(() => evaluateInterview(), 2000);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'interviewer', content: '⚠️ Connection error. Please try again.' }]);
    } finally {
      setSendingMessage(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const evaluateInterview = async () => {
    setEvaluating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/mock-interview/evaluate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.detail || 'Failed to evaluate');
        return;
      }

      const data = await response.json();
      setEvaluation(data.evaluation);
      setView('evaluation');
      setIsExpanded(false);
    } catch (err) {
      alert('Failed to get evaluation. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const resetInterview = () => {
    stopCamera();
    stopRecognition();
    stopSpeaking();
    setView('setup');
    setSessionId(null);
    setMessages([]);
    setEvaluation(null);
    setInputText('');
    setVoiceTranscript('');
    setIsExpanded(false);
    setInterviewType('text');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceSend = () => {
    if (voiceTranscript.trim() || inputText.trim()) {
      stopRecognition();
      sendMessage(voiceTranscript.trim() || inputText.trim());
    }
  };

  if (!user || user.role !== 'student') return null;

  const isVoiceOrVideo = interviewType === 'voice' || interviewType === 'video';
  const panelClass = `mi-panel ${isOpen ? 'mi-panel-open' : ''} ${isExpanded ? 'mi-panel-expanded' : ''}`;

  return (
    <>
      {/* ═══ MASCOT FLOATING BUTTON ═══ */}
      <button
        className={`mi-mascot-btn ${pulseActive ? 'mi-mascot-pulse' : ''} ${isOpen ? 'mi-mascot-hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        title="AI Mock Interview"
        data-testid="mock-interview-mascot"
      >
        <div className="mi-mascot-face">
          <Bot size={28} />
        </div>
        <div className="mi-mascot-badge">
          <Sparkles size={10} />
        </div>
      </button>

      {/* ═══ INTERVIEW PANEL ═══ */}
      <div className={panelClass}>
        {/* Panel Header */}
        <div className="mi-panel-header">
          <div className="mi-panel-header-left">
            <div className="mi-header-avatar">
              <Bot size={20} />
            </div>
            <div>
              <h3>Sankalp Buddy</h3>
              <span className="mi-header-status">
                {view === 'interview'
                  ? `🟢 ${interviewType === 'video' ? 'Video' : interviewType === 'voice' ? 'Voice' : 'Text'} interview`
                  : view === 'evaluation' ? '📊 Evaluation ready'
                  : '✨ Ready to practice'}
              </span>
            </div>
          </div>
          <div className="mi-panel-header-right">
            {view === 'interview' && isVoiceOrVideo && (
              <button
                className={`mi-header-btn ${ttsEnabled ? 'mi-header-btn-active' : ''}`}
                onClick={() => { setTtsEnabled(!ttsEnabled); if (ttsEnabled) stopSpeaking(); }}
                title={ttsEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
              >
                {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            )}
            {view === 'interview' && interviewType === 'video' && (
              <button
                className="mi-header-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            )}
            {view === 'interview' && (
              <button className="mi-header-btn mi-header-end-call" onClick={resetInterview} title="End Interview">
                <PhoneOff size={16} />
              </button>
            )}
            <button className="mi-header-btn" onClick={() => setIsOpen(false)} title="Minimize">
              <ChevronDown size={18} />
            </button>
            <button className="mi-header-btn mi-header-close" onClick={() => { setIsOpen(false); }} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Panel Body */}
        <div className="mi-panel-body">
          {view === 'setup' && (
            <InterviewSetup onStart={startInterview} loading={loading} />
          )}

          {view === 'interview' && (
            <div className={`mi-chat ${isVoiceOrVideo ? 'mi-chat-av' : ''}`}>

              {/* ═══ VIDEO / VOICE AREA ═══ */}
              {isVoiceOrVideo && (
                <div className="mi-av-area">
                  {/* AI Avatar Side */}
                  <div className="mi-av-interviewer">
                    <AIAvatar isSpeaking={isSpeaking} />
                  </div>

                  {/* Candidate Video / Voice Side */}
                  <div className="mi-av-candidate">
                    {interviewType === 'video' ? (
                      <div className="mi-video-container">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="mi-video-feed"
                        />
                        {!isCameraOn && (
                          <div className="mi-video-placeholder">
                            <VideoOff size={32} />
                            <span>Camera Off</span>
                          </div>
                        )}
                        <div className="mi-video-controls">
                          <button
                            className={`mi-av-ctrl-btn ${isCameraOn ? 'mi-av-ctrl-active' : 'mi-av-ctrl-off'}`}
                            onClick={toggleCamera}
                            title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                          >
                            {isCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
                          </button>
                          <button
                            className={`mi-av-ctrl-btn ${isRecording ? 'mi-av-ctrl-recording' : ''}`}
                            onClick={toggleRecording}
                            title={isRecording ? 'Stop recording' : 'Start recording'}
                          >
                            {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                          </button>
                        </div>
                        {/* Your Name Overlay */}
                        <div className="mi-video-name">You</div>
                      </div>
                    ) : (
                      /* Voice Only Mode */
                      <div className="mi-voice-area">
                        <div className={`mi-voice-indicator ${isRecording ? 'mi-voice-active' : ''}`}>
                          {isRecording ? <Mic size={36} /> : <MicOff size={36} />}
                        </div>
                        {micStream && <AudioVisualizer stream={micStream} isRecording={isRecording} />}
                        <button
                          className={`mi-voice-toggle ${isRecording ? 'mi-voice-toggle-active' : ''}`}
                          onClick={toggleRecording}
                        >
                          {isRecording ? 'Stop Listening' : 'Start Speaking'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══ TRANSCRIPT / CHAT ═══ */}
              <div className="mi-chat-messages">
                {messages.map((msg, i) => (
                  <ChatBubble key={i} role={msg.role} content={msg.content} />
                ))}
                {sendingMessage && (
                  <div className="mi-bubble mi-bubble-ai">
                    <div className="mi-bubble-avatar">
                      <Bot size={16} />
                    </div>
                    <div className="mi-bubble-content">
                      <div className="mi-typing">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
                {evaluating && (
                  <div className="mi-evaluating-banner">
                    <RefreshCw size={18} className="mi-spin" />
                    <span>Evaluating your performance...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ═══ INPUT AREA ═══ */}
              <div className="mi-chat-input-area">
                {/* Voice transcript preview */}
                {isVoiceOrVideo && isRecording && voiceTranscript && (
                  <div className="mi-voice-preview">
                    <Mic size={12} className="mi-voice-preview-icon" />
                    <span>{voiceTranscript}</span>
                  </div>
                )}

                <div className="mi-input-wrap">
                  {isVoiceOrVideo && (
                    <button
                      className={`mi-mic-btn ${isRecording ? 'mi-mic-active' : ''}`}
                      onClick={toggleRecording}
                      title={isRecording ? 'Stop listening' : 'Start speaking'}
                      disabled={sendingMessage || evaluating}
                    >
                      {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>
                  )}
                  <textarea
                    ref={inputRef}
                    className="mi-chat-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isVoiceOrVideo ? 'Speak or type your answer...' : 'Type your answer...'}
                    rows={1}
                    disabled={sendingMessage || evaluating}
                  />
                  <button
                    className="mi-send-btn"
                    onClick={isVoiceOrVideo && isRecording ? handleVoiceSend : () => sendMessage()}
                    disabled={(!inputText.trim() && !voiceTranscript.trim()) || sendingMessage || evaluating}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {view === 'evaluation' && (
            <EvaluationResults
              evaluation={evaluation}
              onNewInterview={resetInterview}
              onClose={() => setIsOpen(false)}
            />
          )}
        </div>
      </div>
    </>
  );
}
