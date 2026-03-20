import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Send, Volume2, VolumeX, Bot, User, Languages, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { franc } from 'franc';
import { supabase } from '../supabase';
import { getApiBaseUrl } from '../api';

const languageMapping = {
  asm: 'as-IN', ben: 'bn-IN', bod: 'brx-IN', dgo: 'doi-IN', guj: 'gu-IN', hin: 'hi-IN',
  kan: 'kn-IN', kas: 'ks-IN', kok: 'kok-IN', mai: 'mai-IN', mal: 'ml-IN', mni: 'mni-IN',
  mar: 'mr-IN', npi: 'ne-IN', ory: 'or-IN', pan: 'pa-IN', san: 'sa-IN', sat: 'sat-IN',
  snd: 'sd-IN', tam: 'ta-IN', tel: 'te-IN', urd: 'ur-IN', eng: 'en-US',
};

const services = [
  { label: 'Personal and Family', slug: 'personal-and-family-legal-assistance' },
  { label: 'Business, Consumer and Criminal', slug: 'business-consumer-and-criminal-legal-assistance' },
  { label: 'Consultation', slug: 'consultation' },
];

export default function Chat() {
  const { serviceTitle } = useParams();
  const navigate = useNavigate();

  const activeService = useMemo(() => serviceTitle || 'consultation', [serviceTitle]);
  const displayService = useMemo(
    () => activeService.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
    [activeService]
  );

  const [prompt, setPrompt] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const chatContainerRef = useRef(null);
  const timeoutRef = useRef(null);
  const apiUrl = getApiBaseUrl();
  const clearedKey = useMemo(() => `chat-cleared:${activeService}:${userId || 'default_user'}`, [activeService, userId]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || 'default_user');
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!userId || !apiUrl) return;

      const locallyCleared = window.localStorage.getItem(clearedKey) === 'true';
      if (locallyCleared) {
        setConversation([]);
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/${activeService}/history`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': userId,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setConversation(Array.isArray(data.history) ? data.history : []);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setConversation([]);
      }
    };
    fetchChatHistory();
  }, [userId, activeService, apiUrl, clearedKey]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = 'en-US';

    recog.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setPrompt((prev) => `${prev} ${transcript}`.trim());
      setIsListening(false);
      clearTimeout(timeoutRef.current);
    };

    recog.onerror = () => {
      setIsListening(false);
      clearTimeout(timeoutRef.current);
    };

    recog.onend = () => {
      setIsListening(false);
      clearTimeout(timeoutRef.current);
    };

    setRecognition(recog);
  }, []);

  const detectLanguage = (text) => {
    const langCode = franc(text || '');
    return languageMapping[langCode] || 'en-US';
  };

  const speakText = (text, lang) => {
    if (!isTTSEnabled || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang || 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      clearTimeout(timeoutRef.current);
      return;
    }

    const lastUserMessage = [...conversation].reverse().find((msg) => msg.role === 'user');
    if (lastUserMessage) recognition.lang = detectLanguage(lastUserMessage.content);

    recognition.start();
    setIsListening(true);
    timeoutRef.current = setTimeout(() => {
      recognition.stop();
      setIsListening(false);
    }, 5000);
  };

  const handlePromptSubmit = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || !apiUrl) return;
    setStatusMessage('');

    if (window.localStorage.getItem(clearedKey) === 'true') {
      window.localStorage.removeItem(clearedKey);
    }

    const userMessage = { role: 'user', content: trimmedPrompt, lang: detectLanguage(trimmedPrompt) };
    setConversation((prev) => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);

    const endpoint = `${apiUrl}/${activeService}/chat`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId || 'default_user',
        },
        body: JSON.stringify({ query: trimmedPrompt, user_id: userId || 'default_user' }),
      });
      const data = await res.json();

      if (data.response) {
        setConversation((prev) => [...prev, { role: 'bot', content: data.response, lang: userMessage.lang }]);
      } else {
        setStatusMessage(data.error || 'Unable to fetch response.');
      }
    } catch (error) {
      console.error(error);
      setStatusMessage(error.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!apiUrl || !userId) return;

    setConversation([]);
    setStatusMessage('');
    window.localStorage.setItem(clearedKey, 'true');

    try {
      const res = await fetch(`${apiUrl}/${activeService}/history`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatusMessage(data.error || 'Chat cleared locally, but sync failed.');
      }
    } catch (error) {
      setStatusMessage('Chat cleared locally, but server is unreachable.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handlePromptSubmit();
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">AI Legal Chat</h2>
          <p className="text-sm text-gray-600 font-medium mt-1">Active service: {displayService}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleClearChat}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:text-red-700 inline-flex items-center gap-2"
          >
            <Trash2 size={14} />
            Clear Chat
          </button>
          {services.map((s) => (
            <button
              key={s.slug}
              onClick={() => navigate(`/dashboard/chat/${s.slug}`)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${activeService === s.slug ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm flex-1 min-h-[560px] flex flex-col overflow-hidden">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
          {conversation.length === 0 && (
            <div className="h-full min-h-[280px] flex items-center justify-center text-center text-gray-500">
              <div>
                <Languages className="mx-auto mb-3 text-blue-900" size={24} />
                <p className="font-semibold">Start the conversation</p>
                <p className="text-sm mt-1">Ask a legal question and Vidhi will respond with context-aware guidance.</p>
              </div>
            </div>
          )}

          {conversation.map((msg, index) => (
            <div key={`${msg.role}-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 border ${msg.role === 'user' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-900 border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold opacity-80">
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  {msg.role === 'user' ? 'You' : 'Vidhi'}
                </div>
                {msg.role === 'bot' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
                {msg.role === 'bot' && (
                  <button onClick={() => speakText(msg.content, msg.lang)} className="mt-3 inline-flex items-center gap-1 text-xs text-blue-900 hover:text-blue-700 font-semibold">
                    <Volume2 size={14} /> Speak
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 p-4 bg-white">
          {statusMessage && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {statusMessage}
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setIsTTSEnabled((prev) => !prev)} className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2">
              {isTTSEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              TTS {isTTSEnabled ? 'On' : 'Off'}
            </button>
            <button onClick={toggleListening} className={`px-3 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-2 border ${isListening ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
              <Mic size={14} /> {isListening ? 'Listening...' : 'Voice'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your legal issue..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
            <button
              onClick={handlePromptSubmit}
              disabled={loading}
              className="w-11 h-11 rounded-xl bg-blue-900 text-white inline-flex items-center justify-center hover:bg-blue-800 disabled:opacity-70"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
