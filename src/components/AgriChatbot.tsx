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
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[700px] max-h-[82vh]">
      {/* Top Chat Header */}
      <div className="bg-stone-900 text-stone-100 p-4 border-b border-stone-800 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Ato Desta · Ethiopian Agri Advisor
              </h2>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                Maps Grounded
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Extension knowledge for {currentUser.woreda}, {currentUser.region}
            </p>
          </div>
        </div>

        {/* Model Speed & Complexity Selector */}
        <div className="flex items-center gap-2">
          {/* Segmented Model Switcher */}
          <div className="hidden sm:flex items-center bg-stone-800 p-0.5 rounded-xl border border-stone-700/80 text-xs">
            <button
              onClick={() => setTaskComplexity('fast')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
                taskComplexity === 'fast'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
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
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
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
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Complex Agronomy: gemini-4-argon"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Deep (4.0)</span>
            </button>
          </div>

          <button
            onClick={handleClearHistory}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            title="Clear Chat Thread"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Prompts Carousel Bar */}
      <div className="bg-stone-50 border-b border-stone-200 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider shrink-0">
          Ask:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.prompt)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200 text-xs font-medium whitespace-nowrap transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages Scrollable Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-stone-50/50">
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
                  isUser ? 'bg-stone-800' : 'bg-emerald-700'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2 max-w-[84%]">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-emerald-800 text-white rounded-tr-xs'
                      : 'bg-white text-stone-900 border border-stone-200 rounded-tl-xs'
                  }`}
                >
                  {/* Clean Text with line breaks */}
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Google Maps Grounded Places Links */}
                  {msg.groundingPlaces && msg.groundingPlaces.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-stone-100 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Google Maps Grounded Locations:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.groundingPlaces.map((place, pIdx) => (
                          <a
                            key={pIdx}
                            href={place.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-500 text-stone-800 hover:text-emerald-900 flex items-center justify-between gap-2 text-xs font-semibold transition-all group"
                          >
                            <span className="truncate">{place.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-700 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Meta Row: Audio Readout & Time & Model */}
                  <div
                    className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] ${
                      isUser
                        ? 'border-emerald-700/60 text-emerald-200'
                        : 'border-stone-100 text-stone-600'
                    }`}
                  >
                    <span>{msg.timestamp}</span>

                    <div className="flex items-center gap-2">
                      {msg.modelUsed && <span>{msg.modelUsed}</span>}
                      {!isUser && (
                        <button
                          onClick={() => speakMessage(msg.text, language)}
                          className="hover:text-stone-900 text-stone-600 p-0.5 rounded cursor-pointer"
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
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border border-stone-200 shadow-2xs flex items-center gap-2 text-xs text-stone-500">
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>Ato Desta consulting agricultural maps and models...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0">
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
            className="flex-1 px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder:text-stone-400"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="h-11 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-40 cursor-pointer shrink-0"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
