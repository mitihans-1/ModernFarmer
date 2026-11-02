import React, { useState, useRef, useEffect } from 'react';
import { Sprout, Globe, Calendar as CalendarIcon, Volume2, VolumeX, ShieldCheck, Home, ChevronDown, UserCheck, Store, ShoppingBag, Shield, Check } from 'lucide-react';
import { User, Language, EthiopianDate, NavTab } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface TopBarProps {
  user: User;
  allUsers?: User[];
  onSelectUser?: (userId: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  ethiopianDate: EthiopianDate | null;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  orderCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  allUsers = [],
  onSelectUser,
  language,
  onLanguageChange,
  ethiopianDate,
  activeTab,
  onTabChange,
  audioEnabled,
  onToggleAudio,
  orderCount,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPersonaOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languageOptions: { code: Language; label: string; fullTitle: string }[] = [
    { code: 'en', label: 'English', fullTitle: 'English' },
    { code: 'am', label: 'አማርኛ', fullTitle: 'Amharic (አማርኛ)' },
    { code: 'om', label: 'Oromoo', fullTitle: 'Afaan Oromoo' },
    { code: 'ti', label: 'ትግርኛ', fullTitle: 'Tigrinya (ትግርኛ)' },
  ];
  const currentLang = languageOptions.find((l) => l.code === language) || languageOptions[0];

  const roleIcons = {
    FARMER: <UserCheck className="w-3.5 h-3.5 text-emerald-400" />,
    SUPPLIER: <Store className="w-3.5 h-3.5 text-emerald-400" />,
    BUYER: <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />,
    ADMIN: <Shield className="w-3.5 h-3.5 text-purple-400" />,
  };

  const dateDisplay = ethiopianDate
    ? language === 'am'
      ? ethiopianDate.formattedAm
      : language === 'om'
      ? ethiopianDate.formattedOm
      : language === 'ti'
      ? ethiopianDate.formattedTi
      : ethiopianDate.formattedEn
    : '2019 ዓ.ም (E.C.)';

  return (
    <header 
      className="sticky top-0 z-40 text-[#0F172A] shadow-xs transition-colors"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.15)'
      }}
    >
      {/* Main Top Bar: Spacious Container with Brand — Nav Links — Language, Audio & User Persona */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-20 flex items-center justify-between gap-4 lg:gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          id="topbar-brand-link"
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3 text-left shrink-0 cursor-pointer focus:outline-none group py-1"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#2563EB] group-hover:bg-[#1D4ED8] flex items-center justify-center text-white shadow-sm transition-all">
            <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <span className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-[#0F172A] block leading-tight">
              FarmLink <span className="text-[#2563EB] font-bold">Ethiopia</span>
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#64748B] block tracking-wider uppercase font-semibold">
              {language === 'am' ? 'የገበሬዎች መድረክ' : language === 'om' ? 'Gabaa Qonnaan Bulaa' : 'Agritech Platform'}
            </span>
          </div>
        </button>

        {/* Zone 2: Single-Word Navigation Links (Fit to Width, No Overflow) */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 flex-1 justify-center max-w-2xl">
          <button
            id="nav-tab-home"
            onClick={() => onTabChange('home')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[42px] shrink-0 ${
              activeTab === 'home' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#334155] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.tabHome}</span>
          </button>
          <button
            id="nav-tab-produce"
            onClick={() => onTabChange('produce')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer min-h-[42px] shrink-0 ${
              activeTab === 'produce' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#334155] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            {t.tabProduce}
          </button>
          <button
            id="nav-tab-inputs"
            onClick={() => onTabChange('inputs')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer min-h-[42px] shrink-0 ${
              activeTab === 'inputs' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#334155] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            {t.tabInputs}
          </button>
          <button
            id="nav-tab-prices"
            onClick={() => onTabChange('prices')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer min-h-[42px] shrink-0 ${
              activeTab === 'prices' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#334155] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            {t.tabPrices}
          </button>
          <button
            id="nav-tab-orders"
            onClick={() => onTabChange('orders')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer relative min-h-[42px] flex items-center shrink-0 ${
              activeTab === 'orders' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#334155] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <span>{t.tabOrders}</span>
            {orderCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-[#2563EB] font-black">
                {orderCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onTabChange('aiDoctor')}
            className={`px-3 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1 min-h-[42px] shrink-0 ${
              activeTab === 'aiDoctor' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#334155] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <span>{t.tabAiDoctor}</span>
          </button>
        </nav>

        {/* Zone 3: Audio Toggle, Language Selector & User Role Capsule */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 py-1">
          {/* Spoken Voice Guidance Toggle Button */}
          <button
            onClick={onToggleAudio}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
              audioEnabled
                ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]'
            }`}
            title={audioEnabled ? t.voiceGuideOn : t.voiceGuideOff}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* World Icon + Expandable Dropdown Language Selector */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-2 border border-[#E2E8F0] shadow-xs transition-all cursor-pointer min-h-[44px]"
              title="Select Language / ቋንቋ ይምረጡ"
              aria-label="Select Language"
            >
              <Globe className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span className="font-bold text-[#0F172A] text-xs">{currentLang.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2.5 py-1.5 border-b border-[#E2E8F0] mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    Language / ቋንቋ
                  </span>
                </div>
                <div className="space-y-0.5">
                  {languageOptions.map((opt) => {
                    const isSelected = opt.code === language;
                    return (
                      <button
                        key={opt.code}
                        onClick={() => {
                          onLanguageChange(opt.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-blue-50 text-[#2563EB] font-bold shadow-xs'
                            : 'text-[#334155] hover:bg-slate-50 hover:text-[#0F172A]'
                        }`}
                      >
                        <span className="truncate">{opt.fullTitle}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Persona & Role Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsPersonaOpen(!isPersonaOpen)}
              className="bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 border border-[#E2E8F0] shadow-xs transition-all cursor-pointer min-h-[44px]"
              title="Switch demo persona"
            >
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse hidden sm:inline" />
              <span className="truncate max-w-[80px] sm:max-w-[110px]">{user.fullName.split(' ')[0]}</span>
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200">
                {user.role}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${isPersonaOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Persona Switcher Dropdown Menu */}
            {isPersonaOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Active Context Card (Date, Location, Fayda ID) */}
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] mb-2 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#0F172A]">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{dateDisplay}</span>
                    </div>
                    {user.isVerified && (
                      <span className="flex items-center gap-1 text-[10px] text-[#10B981] font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" /> Fayda Verified
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#64748B] font-medium">
                    📍 {user.woreda}, {user.region}
                  </div>
                  {user.cooperativeName && (
                    <div className="text-[10px] text-[#64748B] truncate">
                      🏢 {user.cooperativeName}
                    </div>
                  )}
                </div>

                <div className="px-2 py-1 border-b border-[#E2E8F0] mb-1.5 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    {t.switchRole || 'Switch Demo Persona'}
                  </span>
                  <span className="text-[10px] text-[#2563EB] font-semibold">Demo Personas</span>
                </div>

                <div className="space-y-1">
                  {allUsers.map((u) => {
                    const isSelected = u.id === user.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          if (onSelectUser) onSelectUser(u.id);
                          setIsPersonaOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 text-[#2563EB] font-bold shadow-xs'
                            : 'text-[#334155] hover:bg-slate-50 hover:text-[#0F172A]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-100 text-[#2563EB]' : 'bg-slate-100 text-[#64748B]'}`}>
                            {roleIcons[u.role] || <UserCheck className="w-3.5 h-3.5" />}
                          </div>
                          <div className="truncate">
                            <div className="font-bold truncate">{u.fullName}</div>
                            <div className={`text-[10px] truncate ${isSelected ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
                              {u.woreda}, {u.region} · {u.role}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 shrink-0 text-[#2563EB]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Secondary Tab Navigation Strip — Fit to Full Width (No Horizontal Scroll) */}
      <div 
        className="lg:hidden w-full px-2 sm:px-4 py-2 transition-colors"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(148, 163, 184, 0.15)'
        }}
      >
        <div className="grid grid-cols-6 gap-1 w-full max-w-7xl mx-auto">
          <button
            onClick={() => onTabChange('home')}
            className={`w-full py-2 px-0.5 sm:px-1 text-[11px] sm:text-xs font-bold rounded-xl cursor-pointer transition-all min-h-[38px] flex items-center justify-center text-center ${
              activeTab === 'home' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#334155] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            {t.tabHome}
          </button>
          <button
            onClick={() => onTabChange('produce')}
            className={`w-full py-2 px-0.5 sm:px-1 text-[11px] sm:text-xs font-bold rounded-xl cursor-pointer transition-all min-h-[38px] flex items-center justify-center text-center ${
              activeTab === 'produce' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#334155] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            {t.tabProduce}
          </button>
          <button
            onClick={() => onTabChange('inputs')}
            className={`w-full py-2 px-0.5 sm:px-1 text-[11px] sm:text-xs font-bold rounded-xl cursor-pointer transition-all min-h-[38px] flex items-center justify-center text-center ${
              activeTab === 'inputs' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#334155] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            {t.tabInputs}
          </button>
          <button
            onClick={() => onTabChange('prices')}
            className={`w-full py-2 px-0.5 sm:px-1 text-[11px] sm:text-xs font-bold rounded-xl cursor-pointer transition-all min-h-[38px] flex items-center justify-center text-center ${
              activeTab === 'prices' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#334155] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            {t.tabPrices}
          </button>
          <button
            onClick={() => onTabChange('orders')}
            className={`w-full py-2 px-0.5 sm:px-1 text-[11px] sm:text-xs font-bold rounded-xl cursor-pointer transition-all min-h-[38px] flex items-center justify-center text-center relative ${
              activeTab === 'orders' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#334155] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <span>{t.tabOrders}</span>
            {orderCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-blue-100 text-[#2563EB] font-black">
                {orderCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onTabChange('aiDoctor')}
            className={`w-full py-2 px-0.5 sm:px-1 text-[11px] sm:text-xs font-bold rounded-xl cursor-pointer transition-all min-h-[38px] flex items-center justify-center text-center ${
              activeTab === 'aiDoctor' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#334155] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            {t.tabAiDoctor}
          </button>
        </div>
      </div>
    </header>
  );
};
