import React, { useState, useRef, useEffect } from 'react';
import { User, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { speakMessage } from '../utils/audioGuidance';
import {
  Send,
  Bot,
  User as UserIcon,
  MapPin,
  ExternalLink,
  Volume2,
  Trash2,
  Sparkles,
  Zap,
  Cpu,
  Compass,
} from 'lucide-react';

interface GroundingPlace {
  title: string;
  uri: string;
  address?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  groundingPlaces?: GroundingPlace[];
  modelUsed?: string;
  timestamp: string;
}

interface AgriChatbotProps {
  currentUser: User;
  language: Language;
}

export const AgriChatbot: React.FC<AgriChatbotProps> = ({ currentUser, language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [taskComplexity, setTaskComplexity] = useState<'fast' | 'general' | 'complex'>('general');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initial welcome message from Ato Desta
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text:
        language === 'am'
          ? `ሰላም ${currentUser.fullName}! እኔ አቶ ደስታ፤ የፋርምሊንክ የግብርና AI አማካሪ ነኝ። ስለ ዘር ወቅት፣ ማዳበሪያ መጠን፣ የተባይ መከላከያ እና በአቅራቢያዎ ስላሉ የህብረት ስራ ማህበራት እና የእህል ገበያዎች መረጃ መስጠት እችላለሁ። ዛሬ ምን ላግዝዎ?`
          : language === 'om'
          ? `Akkam ${currentUser.fullName}! Ani Ato Dastaa, Gorsaa Qonnaa AI FarmLink ti. Waa’ee yeroo sanyii, hamma xaa’oo, ittisa ilbiisotaa fi bakkeewwan gabaa naannoo keessanii odeeffannoo isiniif nan kenna. Maal isin gargaaruu?`
          : `Hello ${currentUser.fullName}! I am **Ato Desta**, your FarmLink Ethiopian Agricultural AI Advisor. I can assist you with planting calendars, precise Urea/NPS fertilizer rates, pest management, and finding verified nearby cooperative depots and grain markets using Google Maps. How can I help your farm today?`,
      groundingPlaces: [
        {
          title: "Ada'a Liben Farmers Cooperative Union Distribution Center",
          uri: "https://www.google.com/maps/search/?api=1&query=Ada'a+Liben+Farmers+Cooperative+Union+Bishoftu",
        },
        {
          title: 'Debre Zeit Agricultural Research Center (EIAR)',
          uri: 'https://www.google.com/maps/search/?api=1&query=Debre+Zeit+Agricultural+Research+Center',
        },
      ],
      modelUsed: 'gemini-3.8-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    {
      label: '📍 Nearby fertilizer depots',
      prompt: `Where are the nearest cooperative union input depots and fertilizer distribution centers near ${currentUser.woreda}, ${currentUser.region}?`,
    },
    {
      label: '🌾 Teff sowing & seed rate',
      prompt: 'What is the recommended planting calendar, seed rate, and spacing for Magna white teff in the highlands?',
    },
    {
      label: '🧪 Fertilizer rate per hectare',
      prompt: 'How much Urea (46% N) and NPS should I apply per hectare for bread wheat, and at what growth stages?',
    },
    {
      label: '🗺️ Addis Ababa Merkato grain markets',
      prompt: 'What are the main grain and pulse trading terminals in Addis Ababa Merkato and what are the directions?',
    },
    {
      label: '☕ Organic coffee rust protection',
      prompt: 'How can smallholders in Sidama prevent coffee leaf rust and berry disease organically?',
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          userLocation: {
            lat: currentUser.lat,
            lng: currentUser.lng,
            woreda: currentUser.woreda,
            region: currentUser.region,
          },
          language,
          taskComplexity,
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat error status: ${res.status}`);
      }

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply || 'I am processing your query.',
        groundingPlaces: data.groundingPlaces || [],
        modelUsed: data.modelUsed || 'gemini-3.8-flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: 'I could not connect to the advisory network. Please check your connection or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: 'Conversation history reset. How can I assist your farm today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)] overflow-hidden flex flex-col h-[700px] max-h-[82vh]">
      {/* Top Chat Header */}
      <div className="bg-[#0F172A] text-white p-5 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Ato Desta · Ethiopian Agri Advisor
              </h2>
              <span className="text-[10px] text-blue-400 font-semibold bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-800/60">
                Maps Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Extension knowledge for {currentUser.woreda}, {currentUser.region}
            </p>
          </div>
        </div>

        {/* Model Speed & Complexity Selector */}
        <div className="flex items-center gap-2">
          {/* Segmented Model Switcher */}
          <div className="hidden sm:flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700/80 text-xs">
            <button
              onClick={() => setTaskComplexity('fast')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
                taskComplexity === 'fast'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fast: gemini-3.1-flash-lite"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Fast</span>
            </button>
            <button
              onClick={() => setTaskComplexity('general')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
                taskComplexity === 'general'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="General + Google Maps: gemini-3.8-flash"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Maps (3.8)</span>
            </button>
            <button
              onClick={() => setTaskComplexity('complex')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
                taskComplexity === 'complex'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Complex Agronomy: gemini-4-argon"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Deep (4.0)</span>
            </button>
          </div>

          <button
            onClick={handleClearHistory}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Clear Chat Thread"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Prompts Carousel Bar */}
      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-2.5 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider shrink-0">
          Ask:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.prompt)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#334155] hover:text-[#2563EB] border border-[#E2E8F0] text-xs font-medium whitespace-nowrap transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages Scrollable Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#F8FAFC]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl ${
                isUser ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs ${
                  isUser ? 'bg-[#0F172A]' : 'bg-[#2563EB]'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2 max-w-[84%]">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-[#2563EB] text-white rounded-tr-xs'
                      : 'bg-white text-[#0F172A] border border-[#E2E8F0] rounded-tl-xs shadow-[0_4px_20px_rgba(15,23,42,0.04)]'
                  }`}
                >
                  {/* Clean Text with line breaks */}
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Google Maps Grounded Places Links */}
                  {msg.groundingPlaces && msg.groundingPlaces.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-[#E2E8F0] space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Google Maps Grounded Locations:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.groundingPlaces.map((place, pIdx) => (
                          <a
                            key={pIdx}
                            href={place.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-blue-50 border border-[#E2E8F0] hover:border-[#2563EB] text-[#0F172A] hover:text-[#2563EB] flex items-center justify-between gap-2 text-xs font-semibold transition-all group"
                          >
                            <span className="truncate">{place.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB] shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Meta Row: Audio Readout & Time & Model */}
                  <div
                    className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] ${
                      isUser
                        ? 'border-blue-400/40 text-blue-100'
                        : 'border-[#E2E8F0] text-[#64748B]'
                    }`}
                  >
                    <span>{msg.timestamp}</span>

                    <div className="flex items-center gap-2">
                      {msg.modelUsed && <span>{msg.modelUsed}</span>}
                      {!isUser && (
                        <button
                          onClick={() => speakMessage(msg.text, language)}
                          className="hover:text-[#2563EB] text-[#64748B] p-0.5 rounded cursor-pointer transition-colors"
                          title="Listen in vernacular"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3 max-w-lg">
            <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border border-[#E2E8F0] shadow-2xs flex items-center gap-2 text-xs text-[#64748B]">
              <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping" />
              <span>Ato Desta consulting agricultural maps and models...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-[#E2E8F0] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              language === 'am'
                ? 'የግብርና ጥያቄዎን እዚህ ይጠይቁ (ለምሳሌ፡ የጤፍ ዘር ወቅት፣ ማዳበሪያ፣ የአቅራቢያ መጋዘን)...'
                : language === 'om'
                ? 'Gaaffii qonnaa keessan asitti gaafadhaa (fkn. yeroo sanyii, xaa’oo, kuusaa)...'
                : 'Ask Ato Desta (e.g. fertilizer rate per hectare, nearby depots, Teff planting)...'
            }
            className="flex-1 px-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="h-11 px-5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-40 cursor-pointer shrink-0"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
