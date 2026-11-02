import React from 'react';
import {
  Sprout,
  PhoneCall,
  ShieldCheck,
  HeartHandshake,
  MapPin,
  Building2,
  Home,
  ArrowUpRight,
  Lock,
  Smartphone,
  Sparkles,
  TrendingUp,
  Package,
  Layers,
  Bot
} from 'lucide-react';
import { Language, NavTab } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface FooterProps {
  language: Language;
  onNavigateTab: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onNavigateTab }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <footer className="relative bg-[#0F172A] border-t border-slate-800 text-[#CBD5E1] mt-16 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP TRUST & ESCROW ACTION STRIP                                        */}
      {/* ========================================================================= */}
      <div className="border-b border-slate-800/80 bg-[#0B1120]">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Trust Pillar 1: Zero-Risk Bank Escrow */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-[#60A5FA] border border-slate-700 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-[#60A5FA]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#FFFFFF] block">
                  {language === 'am' ? 'በቴሌብርና CBE የዋስትና ቁጠባ' : 'Telebirr & CBE Escrow Protection'}
                </span>
                <span className="text-[11px] text-[#CBD5E1] block">
                  {language === 'am' ? 'ምርቱ እስኪረጋገጥ ገንዘቡ በአስተማማኝ ሁኔታ ይያዛል' : 'Funds locked securely until physical inspection & OTP'}
                </span>
              </div>
            </div>

            {/* Trust Pillar 2: Ministry of Agriculture Helpline */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-[#60A5FA] border border-slate-700 flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5 text-[#60A5FA]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#FFFFFF] block">
                  {language === 'am' ? 'ነፃ የአርሶ አደር የስልክ መስመር፡ 8028' : 'MoA Toll-Free Advisory: 8028'}
                </span>
                <span className="text-[11px] text-[#CBD5E1] block">
                  {language === 'am' ? 'የግብርና ሚኒስቴር የድምፅና መረጃ ድጋፍ' : 'Nationwide 24/7 IVR extension service'}
                </span>
              </div>
            </div>

            {/* Trust Pillar 3: Offline USSD & Fayda ID */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-[#60A5FA] border border-slate-700 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-[#60A5FA]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#FFFFFF] block">
                  {language === 'am' ? 'ያለ ኢንተርኔት በUSSD፡ *127#' : 'Offline USSD Access: *127#'}
                </span>
                <span className="text-[11px] text-[#CBD5E1] block">
                  {language === 'am' ? 'ለባለ ቁልፍ ስልኮች ከፋይዳ ብሔራዊ መታወቂያ ጋር' : 'Telebirr 2G feature phones & Fayda ID network'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 5-COLUMN DIRECTORY GRID                                           */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">

          {/* Column 1: Brand & National Mission (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-[#FFFFFF] block leading-none">
                  FarmLink <span className="text-[#60A5FA] font-bold">Ethiopia</span>
                </span>
                <span className="text-[10px] text-[#CBD5E1]/70 block uppercase tracking-wider font-semibold">
                  {language === 'am' ? 'ቀጥተኛ የግብርና ግብይት መድረክ' : 'Direct Agricultural Marketplace'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#CBD5E1] leading-relaxed font-normal max-w-sm">
              {language === 'am'
                ? 'የኢትዮጵያ አርሶ አደሮችን፣ የሕብረት ሥራ ዩኒየኖችን እና የተረጋገጡ ግብዓት አቅራቢዎችን ያለ ደላላ ጣልቃ ገብነት በቀጥታ የሚያገናኝ፤ በቴሌብርና CBE ብር ዋስትና የሚሰራ ዲጂታል መድረክ።'
                : language === 'om'
                  ? 'Qonnaan bultoota Itoophiyaa, yuuniyeeniiwwan waldaa fi dhiyeessitoota galtee qulqulluu gidduutti gabaa qajeelaa kan uumu, kaffaltii Telebirr fi CBE Birr eegumsa qabu.'
                  : 'Direct digital agricultural marketplace connecting Ethiopian smallholders and cooperative unions directly to buyers and certified agro-dealers with zero dallala broker markups.'}
            </p>

            <div className="space-y-2 pt-1 text-[11px]">
              <div className="flex items-center gap-2 text-[#CBD5E1] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#60A5FA] shrink-0" />
                <span>Aligned with MoA & ATI Cooperative Frameworks</span>
              </div>
              <div className="flex items-center gap-2 text-[#CBD5E1]/80">
                <HeartHandshake className="w-4 h-4 text-[#60A5FA] shrink-0" />
                <span>Fayda National ID Verified Trading Network</span>
              </div>
            </div>
          </div>

          {/* Column 2: Produce Marketplace (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
              <span>{t.tabProduce}</span>
            </h4>
            <ul className="space-y-2 text-xs text-[#CBD5E1]">
              <li>
                <button
                  onClick={() => onNavigateTab('produce')}
                  className="hover:text-[#60A5FA] transition-colors text-left cursor-pointer flex items-center justify-between w-full group"
                >
                  <span>Magna White Teff</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#60A5FA]" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('produce')}
                  className="hover:text-[#60A5FA] transition-colors text-left cursor-pointer flex items-center justify-between w-full group"
                >
                  <span>Dande’a Bread Wheat</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#60A5FA]" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('produce')}
                  className="hover:text-[#60A5FA] transition-colors text-left cursor-pointer flex items-center justify-between w-full group"
                >
                  <span>Sidama Washed Coffee</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#60A5FA]" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('produce')}
                  className="hover:text-[#60A5FA] transition-colors text-left cursor-pointer flex items-center justify-between w-full group"
                >
                  <span>Red Bombay Onions</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#60A5FA]" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('produce')}
                  className="text-[#60A5FA] font-semibold hover:text-[#93C5FD] transition-colors text-left cursor-pointer pt-1 block"
                >
                  {language === 'am' ? 'ሁሉንም ምርቶች ያስሱ →' : 'Browse All Produce →'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Certified Inputs & Fertilizers (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
              <span>{t.tabInputs}</span>
            </h4>
            <ul className="space-y-2 text-xs text-[#CBD5E1]">
              <li>
                <button
                  onClick={() => onNavigateTab('inputs')}
                  className="hover:text-[#60A5FA] transition-colors text-left cursor-pointer flex items-center justify-between w-full group"
                >
                  <span>Subsidized Urea & NPS</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#60A5FA]" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('inputs')}
                  className="hover:text-[#60A5FA] transition-colors text-left cursor-pointer flex items-center justify-between w-full group"
                >
                  <span>Certified Hybrid Seeds</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#60A5FA]" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('inputs')}
                  className="hover:text-[#60A5FA] transition-colors text-left cursor-pointer flex items-center justify-between w-full group"
                >
                  <span>Tebuconazole Pesticides</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#60A5FA]" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('inputs')}
                  className="hover:text-[#60A5FA] transition-colors text-left cursor-pointer flex items-center justify-between w-full group"
                >
                  <span>Sprayers & Farm PPE</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#60A5FA]" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('inputs')}
                  className="text-[#60A5FA] font-semibold hover:text-[#93C5FD] transition-colors text-left cursor-pointer pt-1 block"
                >
                  {language === 'am' ? 'የግብዓቶች ካታሎግ →' : 'Agro-Inputs Catalog →'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: AgTech & AI Services (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
              <span>Digital Services</span>
            </h4>
            <ul className="space-y-2 text-xs text-[#CBD5E1]">
              <li>
                <button
                  onClick={() => onNavigateTab('aiDoctor')}
                  className="hover:text-[#60A5FA] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-[#60A5FA]" />
                  <span>{t.tabAiDoctor}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('prices')}
                  className="hover:text-[#60A5FA] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <TrendingUp className="w-3 h-3 text-[#60A5FA]" />
                  <span>{t.tabPrices}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('chat')}
                  className="hover:text-[#60A5FA] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <Bot className="w-3 h-3 text-[#60A5FA]" />
                  <span>Ato Desta Advisor</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('3d')}
                  className="hover:text-[#60A5FA] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <Layers className="w-3 h-3 text-[#60A5FA]" />
                  <span>3D Agri Viewer</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('orders')}
                  className="hover:text-[#60A5FA] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3 text-[#60A5FA]" />
                  <span>{t.tabOrders} (Escrow)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Regional Hubs & Helplines (Span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
              <span>Regional Hubs</span>
            </h4>
            <div className="space-y-2 text-xs text-[#CBD5E1]">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#FFFFFF] block">Ada'a Liben Union</span>
                <span className="text-[10px] text-[#CBD5E1]/80 block">Bishoftu, East Shewa · Oromia</span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#FFFFFF] block">Lume Farmers Union</span>
                <span className="text-[10px] text-[#CBD5E1]/80 block">Mojo Depot Hub · Oromia</span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#FFFFFF] block">Bahir Dar & Gondar</span>
                <span className="text-[10px] text-[#CBD5E1]/80 block">Gojjam Grain Depot · Amhara</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-[#FFFFFF] block font-semibold">Payment Rails:</span>
                <span className="text-[10px] text-[#CBD5E1]/80 block">Telebirr · CBE Birr · Chapa</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM LEGAL, INSTITUTIONAL & COPYRIGHT STRIP                          */}
      {/* ========================================================================= */}
      <div className="border-t border-slate-800 bg-[#060913] py-6 text-xs text-[#CBD5E1]">
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright with Ethiopian Calendar Standard */}
          <div className="flex items-center gap-2 text-xs text-[#CBD5E1]">
            <span>© 2019 ዓ.ም (2026 G.C.) FarmLink Ethiopia. All rights reserved.</span>
          </div>

          {/* System Live Operational Status */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[#CBD5E1] font-medium">Banking Escrow Rails: Live & Operational</span>
          </div>

          {/* Institutional Policy Links */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#CBD5E1]">
            <span className="hover:text-[#60A5FA] transition-colors cursor-pointer">Cooperative Quota Rules</span>
            <span className="text-slate-700">·</span>
            <span className="hover:text-[#60A5FA] transition-colors cursor-pointer">Escrow Dispute Policy</span>
            <span className="text-slate-700">·</span>
            <span className="hover:text-[#60A5FA] transition-colors cursor-pointer">Terms & Privacy</span>
            <span className="text-slate-700">·</span>
            <span className="hover:text-[#60A5FA] transition-colors cursor-pointer">MoA Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
