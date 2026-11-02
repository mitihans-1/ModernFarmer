import React, { useState } from 'react';
import {
  Sprout,
  TrendingUp,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  Lock,
  CheckCircle2,
  PhoneCall,
  Package,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Volume2,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  Check
} from 'lucide-react';
import { User, Language, EthiopianDate, PriceReport, Product, ProduceListing, NavTab } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { speakMessage } from '../utils/audioGuidance';

interface HomePageProps {
  currentUser: User;
  language: Language;
  ethiopianDate: EthiopianDate | null;
  priceReports: PriceReport[];
  products?: (Product & { distanceKm?: number })[];
  produceListings?: (ProduceListing & { distanceKm?: number })[];
  onNavigateTab: (tab: NavTab) => void;
  audioEnabled: boolean;
  onOrderProduct?: (product: Product) => void;
  onOrderProduce?: (listing: ProduceListing) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentUser,
  language,
  ethiopianDate,
  priceReports,
  products = [],
  produceListings = [],
  onNavigateTab,
  audioEnabled,
  onOrderProduce,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [tickerFilter, setTickerFilter] = useState<'ALL' | 'TEFF' | 'WHEAT' | 'COFFEE'>('ALL');
  const [activeDemoSample, setActiveDemoSample] = useState<'teff_rust' | 'wheat_rust'>('teff_rust');

  const handleSpeak = (text: string) => {
    if (audioEnabled) {
      speakMessage(text, language);
    }
  };

  const filteredPrices = priceReports.filter((report) => {
    if (tickerFilter === 'ALL') return true;
    const name = report.commodity.toLowerCase();
    if (tickerFilter === 'TEFF') return name.includes('teff') || name.includes('ጤፍ') || name.includes('xaafii');
    if (tickerFilter === 'WHEAT') return name.includes('wheat') || name.includes('ስንዴ') || name.includes('qamadii');
    if (tickerFilter === 'COFFEE') return name.includes('coffee') || name.includes('ቡና') || name.includes('buna');
    return true;
  });

  const demoData = {
    teff_rust: {
      crop: 'Eragrostis tef (Teff / ጤፍ)',
      pathology: 'Teff Leaf Rust (Uromyces eragrostidis)',
      confidence: '98.4%',
      prescription: 'Tebuconazole 250 EC (1.0 L/ha)',
      inventory: '1,850 ETB / Liter (In Stock: Bishoftu)',
      badgeColor: 'text-[#2563EB] bg-blue-50 border-blue-200'
    },
    wheat_rust: {
      crop: 'Triticum aestivum (Wheat / ስንዴ)',
      pathology: 'Stripe Rust / Yellow Rust (Puccinia striiformis)',
      confidence: '99.1%',
      prescription: 'Propiconazole 25% EC (500 ml/ha)',
      inventory: '2,100 ETB / Liter (In Stock: Bahir Dar)',
      badgeColor: 'text-[#EF4444] bg-red-50 border-red-200'
    }
  };

  const activeDemo = demoData[activeDemoSample];

  return (
    <div 
      className="font-sans text-[#334155] -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12 -my-5"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 50%, #EEF5FF 100%)'
      }}
    >

      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E2E8F0]/80 py-16 lg:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Heading, Single Sentence, Primary & Secondary CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-[#0F172A]">
                {language === 'am' ? (
                  <>
                    ውብና ለም የሆነው <br />
                    <span className="text-[#2563EB]">የኢትዮጵያ አርሶ አደሮች ማሳ፦</span> <br />
                    ቀጥተኛ የገበያ ድልድይ
                  </>
                ) : language === 'om' ? (
                  <>
                    Gabaa Qajeelaa <br />
                    <span className="text-[#2563EB]">Qonnaan Bulaa Itoophiyaa:</span> <br />
                    Oomisha Qulqulluu
                  </>
                ) : (
                  <>
                    Connecting Ethiopia's <br />
                    <span className="text-[#2563EB]">Farmers & Unions:</span> <br />
                    Direct Marketplace
                  </>
                )}
              </h1>

              <p className="text-[#334155] text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                {language === 'am'
                  ? 'ያለ ደላላ ጣልቃ ገብነት ምርትዎን በቀጥታ ይሽጡ፣ የተረጋገጡ ግብዓቶችን ይግዙ፣ በቴሌብርና በCBE ብር የባንክ ዋስትና በአስተማማኝ ሁኔታ ይገበያዩ።'
                  : language === 'om'
                  ? 'Kallattiin oomisha keessan gurguraa, galtee qulqulluu bitaa, kaffaltii Telebirr fi CBE Birr eegumsa qabuun daldalaa.'
                  : 'Connect directly with verified buyers, purchase certified fertilizer and seed, and trade securely with guaranteed Telebirr and CBE bank escrow.'}
              </p>

              {/* Action Buttons: One Primary, One Secondary (44px min touch target) */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={() => onNavigateTab('produce')}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all text-sm min-h-[44px] inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>{language === 'am' ? 'ምርቶችን ያስሱ' : language === 'om' ? 'Oomisha Ilaali' : 'Browse Produce'}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

                <button
                  onClick={() => onNavigateTab('prices')}
                  className="bg-white hover:bg-slate-50 text-[#0F172A] font-semibold px-6 py-3 rounded-xl border border-[#E2E8F0] shadow-xs transition-all text-sm min-h-[44px] inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>{language === 'am' ? 'የዛሬ የገበያ ዋጋ' : language === 'om' ? 'Gatii Gabaa Har\'aa' : 'Check Daily Prices'}</span>
                  <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                </button>

                {audioEnabled && (
                  <button
                    onClick={() => handleSpeak(`${t.homeHeroTitle}. ${t.homeHeroSubtitle}`)}
                    className="p-3 rounded-xl bg-white hover:bg-slate-50 text-[#64748B] border border-[#E2E8F0] transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shadow-xs"
                    title="Read aloud"
                  >
                    <Volume2 className="w-4 h-4 text-[#64748B]" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Farmer Portrait Blending Naturally */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative rounded-[24px] overflow-hidden border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)] bg-white max-w-md w-full aspect-[4/3.8] group">
                <img
                  src="/images/farmer_hero_portrait.jpg"
                  alt="Ethiopian farmer in agricultural field"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                {/* Lateral and bottom gradient masks for natural edge fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-transparent opacity-50" />

                {/* Floating Verified Badge */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#E2E8F0] shadow-md flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span className="font-bold text-[#0F172A] text-[11px] truncate">
                      {currentUser.fullName} · {currentUser.role}
                    </span>
                  </div>
                  <span className="text-[#10B981] font-bold text-[10px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    Fayda Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. TRUST STRIP (Immediately Near Top)                                     */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E2E8F0]/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Pillar 1: Escrow */}
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-5 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">
                  {language === 'am' ? 'በቴሌብርና CBE የዋስትና ቁጠባ' : 'Telebirr & CBE Escrow'}
                </span>
                <span className="text-xs text-[#64748B] block leading-snug">
                  {language === 'am' ? 'ምርቱ እስኪረከብ ድረስ ገንዘብ በባንክ ቋት ይያዛል' : 'Funds held safely until physical inspection & OTP release'}
                </span>
              </div>
            </div>

            {/* Pillar 2: Fayda ID */}
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-5 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">
                  {language === 'am' ? 'የተረጋገጠ የፋይዳ ብሔራዊ መታወቂያ' : 'Fayda National ID Verified'}
                </span>
                <span className="text-xs text-[#64748B] block leading-snug">
                  {language === 'am' ? 'እያንዳንዱ አርሶ አደርና ነጋዴ ማንነቱ የተረጋገጠ ነው' : 'Every smallholder, cooperative union, and buyer authenticated'}
                </span>
              </div>
            </div>

            {/* Pillar 3: 8028 Helpline */}
            <div className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-5 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">
                  {language === 'am' ? 'የግብርና ሚኒስቴር ነፃ መስመር 8028' : 'MoA Advisory Hotline: 8028'}
                </span>
                <span className="text-xs text-[#64748B] block leading-snug">
                  {language === 'am' ? '24/7 የድምፅና መረጃ ድጋፍ በነፃ ይደውሉ' : 'Toll-free nationwide agricultural extension & advisory'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MAIN VALUE: THE THREE THINGS A VISITOR DOES                            */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E2E8F0]/80 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
              {language === 'am' ? 'በFarmLink ምን ማድረግ ይችላሉ?' : 'Everything You Need to Trade & Grow'}
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed font-normal">
              {language === 'am'
                ? 'ያለ ደላላ ብዝበዛ ምርትዎን በቀጥታ ይሽጡ፣ የተረጋገጡ ግብዓቶችን ይግዙ፣ እና የገበያ መረጃ ያግኙ።'
                : 'Direct agricultural commerce designed for Ethiopian smallholders, cooperative unions, and buyers.'}
            </p>
          </div>

          {/* 3 Main Value Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Buy & Sell Produce */}
            <div className="bg-white border border-[#E2E8F0] hover:border-blue-400 rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-7 flex flex-col justify-between space-y-4 transition-all duration-300 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-[#2563EB]" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                  {language === 'am' ? 'የአዝመራ ምርት መገበያያ' : '1. Buy & Sell Grain and Coffee'}
                </h3>
                <p className="text-xs sm:text-sm text-[#334155] leading-relaxed font-normal">
                  {language === 'am'
                    ? 'ማኛ ጤፍ፣ የዳቦ ስንዴ፣ የሲዳማ ቡና እና ሽንኩርት ያለ ደላላ ጣልቃ ገብነት ከአርሶ አደሮችና ዩኒየኖች በቀጥታ ይገበያዩ።'
                    : 'Direct farmgate access to Magna White Teff, Dande’a Bread Wheat, and Sidama Heirloom Coffee with transparent moisture and grade standards.'}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('produce')}
                className="text-xs sm:text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1.5 cursor-pointer pt-2 min-h-[44px] transition-colors"
              >
                <span>{language === 'am' ? 'ምርቶችን ያስሱ' : 'Browse Produce Market'}</span>
                <ChevronRight className="w-4 h-4 text-[#2563EB]" />
              </button>
            </div>

            {/* Card 2: Certified Inputs */}
            <div className="bg-white border border-[#E2E8F0] hover:border-blue-400 rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-7 flex flex-col justify-between space-y-4 transition-all duration-300 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-[#2563EB]" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                  {language === 'am' ? 'የተረጋገጡ ግብዓቶችና ዘሮች' : '2. Certified Inputs & Fertilizer'}
                </h3>
                <p className="text-xs sm:text-sm text-[#334155] leading-relaxed font-normal">
                  {language === 'am'
                    ? 'የመንግስት ድጎማ ያለባቸው ዩሪያና NPS ማዳበሪያ፣ የተመረጡ ምርጥ ዘሮችና የፀረ-ተባይ መድሃኒቶችን በቀጥታ ይግዙ።'
                    : 'Order government-subsidized Urea and NPS fertilizers, certified hybrid seeds, and safe active-ingredient crop protection from licensed dealers.'}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('inputs')}
                className="text-xs sm:text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1.5 cursor-pointer pt-2 min-h-[44px] transition-colors"
              >
                <span>{language === 'am' ? 'የግብዓቶች ካታሎግ' : 'Explore Inputs Catalog'}</span>
                <ChevronRight className="w-4 h-4 text-[#2563EB]" />
              </button>
            </div>

            {/* Card 3: Live Prices */}
            <div className="bg-white border border-[#E2E8F0] hover:border-blue-400 rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-7 flex flex-col justify-between space-y-4 transition-all duration-300 group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#2563EB]" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                  {language === 'am' ? 'የቀጥታ የገበያ ዋጋ መረጃ' : '3. Real-Time Price Intelligence'}
                </h3>
                <p className="text-xs sm:text-sm text-[#334155] leading-relaxed font-normal">
                  {language === 'am'
                    ? 'የመርካቶ፣ ቢሾፍቱ፣ ባሕር ዳር እና የECX የቀን የጅምላ መሸጫ ዋጋዎችንና የዋጋ ለውጦችን በየሰዓቱ ይከታተሉ።'
                    : 'Track verified daily wholesale prices across Merkato, Bishoftu, Bahir Dar, and regional grain trading hubs before negotiating deals.'}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('prices')}
                className="text-xs sm:text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1.5 cursor-pointer pt-2 min-h-[44px] transition-colors"
              >
                <span>{language === 'am' ? 'የዋጋ ሰሌዳ ይመልከቱ' : 'View Daily Price Board'}</span>
                <ChevronRight className="w-4 h-4 text-[#2563EB]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. LIVE CONTENT: FEATURED PRODUCE & TODAY'S MARKET PRICES                 */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E2E8F0]/80 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          {/* Part A: Featured Produce Listings */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
                  {language === 'am' ? 'ተለይተው የቀረቡ አዝመራዎች' : 'Featured Farmgate Produce'}
                </h2>
                <p className="text-sm sm:text-base text-[#64748B] leading-relaxed font-normal">
                  {language === 'am' ? 'ከአዳማ፣ ቢሾፍቱና ሲዳማ ዩኒየኖች የቀረቡ ትኩስ ምርቶች' : 'Verified grain and coffee batches ready for escrow purchase.'}
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('produce')}
                className="text-xs sm:text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer self-start sm:self-auto min-h-[44px] transition-colors"
              >
                <span>{language === 'am' ? 'ሁሉንም ምርቶች ይመልከቱ' : 'View All Produce'}</span>
                <ChevronRight className="w-4 h-4 text-[#2563EB]" />
              </button>
            </div>

            {/* Visual Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Product 1: Magna White Teff */}
              <div className="bg-white rounded-[24px] overflow-hidden border border-[#E2E8F0] hover:border-blue-400 p-5 flex flex-col justify-between shadow-[0_10px_40px_rgba(15,23,42,0.08)] transition-all duration-300">
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden h-48 w-full bg-slate-100">
                    <img
                      src="/images/farmer_teff_field.jpg"
                      alt="Magna Teff Field"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="bg-white/95 text-[#2563EB] border border-blue-200 font-semibold text-[11px] px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs">
                        Certified Seed
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="bg-slate-900/80 text-white border border-slate-700 font-semibold text-[11px] px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs">
                        50 Qtl
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#0F172A]">Magna White Teff (DZ-Cr-37)</h3>
                    <p className="text-xs text-[#64748B] font-medium">Ada'a Liben Union · Bishoftu, Oromia</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] px-3 py-1.5 rounded-xl font-bold text-xs">
                    7,200 ETB / Qtl
                  </span>

                  <button
                    onClick={() => onNavigateTab('produce')}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer min-h-[44px] shadow-sm"
                  >
                    Order with Escrow
                  </button>
                </div>
              </div>

              {/* Product 2: Bread Wheat */}
              <div className="bg-white rounded-[24px] overflow-hidden border border-[#E2E8F0] hover:border-blue-400 p-5 flex flex-col justify-between shadow-[0_10px_40px_rgba(15,23,42,0.08)] transition-all duration-300">
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden h-48 w-full bg-slate-100">
                    <img
                      src="/images/farmer_wheat_harvest.jpg"
                      alt="Bread Wheat Harvest"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="bg-white/95 text-[#2563EB] border border-blue-200 font-semibold text-[11px] px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs">
                        Grade 1 Wheat
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="bg-slate-900/80 text-white border border-slate-700 font-semibold text-[11px] px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs">
                        75 Qtl
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#0F172A]">Dande’a Bread Wheat</h3>
                    <p className="text-xs text-[#64748B] font-medium">Lume Farmers Union · Mojo, Oromia</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] px-3 py-1.5 rounded-xl font-bold text-xs">
                    4,200 ETB / Qtl
                  </span>

                  <button
                    onClick={() => onNavigateTab('produce')}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer min-h-[44px] shadow-sm"
                  >
                    Order with Escrow
                  </button>
                </div>
              </div>

              {/* Product 3: Sidama Specialty Coffee */}
              <div className="bg-white rounded-[24px] overflow-hidden border border-[#E2E8F0] hover:border-blue-400 p-5 flex flex-col justify-between shadow-[0_10px_40px_rgba(15,23,42,0.08)] transition-all duration-300">
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden h-48 w-full bg-slate-100">
                    <img
                      src="/images/farmer_coffee_harvest.jpg"
                      alt="Sidama Coffee Harvest"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="bg-white/95 text-[#2563EB] border border-blue-200 font-semibold text-[11px] px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs">
                        Grade 1 Washed
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="bg-slate-900/80 text-white border border-slate-700 font-semibold text-[11px] px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs">
                        30 Qtl
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#0F172A]">Sidama Heirloom Coffee</h3>
                    <p className="text-xs text-[#64748B] font-medium">Aleta Wondo Union · Sidama Zone</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] px-3 py-1.5 rounded-xl font-bold text-xs">
                    18,500 ETB / Qtl
                  </span>

                  <button
                    onClick={() => onNavigateTab('produce')}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer min-h-[44px] shadow-sm"
                  >
                    Order with Escrow
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Part B: Today's Market Price Board */}
          <div className="pt-6 border-t border-[#E2E8F0]/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight mb-1">
                  {t.homeLiveTickerTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] font-normal">
                  {t.homeDailyReportsSub}
                </p>
              </div>

              {/* Commodity Filters */}
              <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl border border-slate-300 text-xs">
                {(['ALL', 'TEFF', 'WHEAT', 'COFFEE'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTickerFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer min-h-[36px] ${
                      tickerFilter === filter
                        ? 'bg-white text-[#0F172A] shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {filter === 'ALL' ? t.categoryAll : filter === 'TEFF' ? t.cropTeff : filter === 'WHEAT' ? t.cropWheat : t.cropCoffee}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Ticker Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredPrices.slice(0, 4).map((report) => {
                const isUp = report.trend === 'UP';
                const isDown = report.trend === 'DOWN';
                return (
                  <div
                    key={report.id}
                    onClick={() => onNavigateTab('prices')}
                    className="bg-white rounded-[24px] p-5 border border-[#E2E8F0] hover:border-blue-400 shadow-[0_10px_40px_rgba(15,23,42,0.08)] transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                          {report.marketName} · {report.region}
                        </span>
                        <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                          {report.commodity}
                        </h3>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isUp ? 'bg-emerald-50 text-[#10B981] border border-emerald-200'
                            : isDown ? 'bg-red-50 text-[#EF4444] border border-red-200'
                              : 'bg-slate-100 text-[#64748B]'
                        }`}
                      >
                        {isUp ? <ArrowUpRight className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : null}
                        {report.changePct > 0 ? `+${report.changePct}%` : `${report.changePct}%`}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex items-baseline justify-between">
                      <span className="text-xs text-[#64748B] font-medium">
                        {t.homeAvgPerUnit} {report.unit}:
                      </span>
                      <div className="text-base font-black text-[#0F172A]">
                        {report.avgPriceEtb.toLocaleString()}{' '}
                        <span className="text-xs font-semibold text-[#64748B]">ETB</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW IT WORKS: 4 SIMPLE ESCROW STEPS                                    */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E2E8F0]/80 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
              {language === 'am' ? 'ከኪሳራ የጸዳ ግብይት እንዴት ይሰራል?' : 'How Zero-Risk Escrow Trading Works'}
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed font-normal">
              {language === 'am'
                ? 'ከመጀመሪያው ትዕዛዝ እስከ ክፍያ መልቀቅ ድረስ በ4 የተጠበቁ ደረጃዎች'
                : 'Four transparent steps that protect both buyer and farmer from fraud and exploitation.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white border border-[#E2E8F0] hover:border-blue-400 p-6 rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.08)] space-y-3 relative transition-all duration-300">
              <span className="text-3xl font-black text-slate-300">01</span>
              <h3 className="text-base font-bold text-[#0F172A]">
                {language === 'am' ? 'ምርቱን ወይም ግብዓቱን ይምረጡ' : 'Browse & Place Order'}
              </h3>
              <p className="text-xs text-[#334155] leading-relaxed font-normal">
                {language === 'am'
                  ? 'የተረጋገጠ አዝመራ ወይም ግብዓት ከተረጋገጠ ዋጋና ዝርዝር መረጃ ጋር ይመርጣሉ።'
                  : 'Select certified produce or agro-inputs from authenticated smallholders and cooperative unions.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#E2E8F0] hover:border-blue-400 p-6 rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.08)] space-y-3 relative transition-all duration-300">
              <span className="text-3xl font-black text-slate-300">02</span>
              <h3 className="text-base font-bold text-[#0F172A]">
                {language === 'am' ? 'ክፍያን በባንክ ቋት ያስይዙ' : 'Deposit into Bank Escrow'}
              </h3>
              <p className="text-xs text-[#334155] leading-relaxed font-normal">
                {language === 'am'
                  ? 'ገዥው ክፍያውን በቴሌብር ወይም በCBE ብር የዋስትና ቋት (Escrow) ውስጥ ያስቀምጣል።'
                  : 'Buyer deposits funds into secure Telebirr or CBE Birr escrow. Money is locked and safe.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#E2E8F0] hover:border-blue-400 p-6 rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.08)] space-y-3 relative transition-all duration-300">
              <span className="text-3xl font-black text-slate-300">03</span>
              <h3 className="text-base font-bold text-[#0F172A]">
                {language === 'am' ? 'በወረዳ ማዕከል ጥራቱን ያረጋግጡ' : 'Inspect Quality at Depot'}
              </h3>
              <p className="text-xs text-[#334155] leading-relaxed font-normal">
                {language === 'am'
                  ? 'ምርቱ በሕብረት ሥራ ማህበር መጋዘን ሲደርስ እርጥበትና ደረጃው በአካል ይመረመራል።'
                  : 'Grain or coffee is delivered to the woreda cooperative depot for physical inspection and moisture check.'}
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-[#E2E8F0] hover:border-blue-400 p-6 rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.08)] space-y-3 relative transition-all duration-300">
              <span className="text-3xl font-black text-slate-300">04</span>
              <h3 className="text-base font-bold text-[#0F172A]">
                {language === 'am' ? 'በ4-አሃዝ OTP ክፍያውን ይልቀቁ' : 'Release with 4-Digit OTP'}
              </h3>
              <p className="text-xs text-[#334155] leading-relaxed font-normal">
                {language === 'am'
                  ? 'ገዥው ጥራቱን ካረጋገጠ በኋላ በሚስጥር በደረሰው OTP ክፍያው ወዲያውኑ ለአርሶ አደሩ ይለቀቃል።'
                  : 'Upon approving quality, the buyer shares their SMS OTP code to immediately release funds to the farmer.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SOCIAL PROOF & COOPERATIVE IMPACT                                      */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E2E8F0]/80 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
              {language === 'am' ? 'በኢትዮጵያ አርሶ አደሮች የታመነ' : 'Trusted by Ethiopian Smallholders & Unions'}
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed font-normal">
              {language === 'am'
                ? 'በኦሮሚያ፣ አማራና ሲዳማ ክልሎች የሕብረት ሥራ ዩኒየኖችንና አርሶ አደሮችን እያስተሳሰረ የሚገኝ መድረክ'
                : 'Building transparent regional trade corridors backed by the Ministry of Agriculture.'}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] text-center shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
              <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">120K+</div>
              <div className="text-xs text-[#64748B] font-semibold uppercase tracking-wider mt-1">
                Quintals Traded
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] text-center shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
              <div className="text-2xl sm:text-3xl font-black text-[#2563EB]">4,200+</div>
              <div className="text-xs text-[#64748B] font-semibold uppercase tracking-wider mt-1">
                Verified Smallholders
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] text-center shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
              <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">0%</div>
              <div className="text-xs text-[#64748B] font-semibold uppercase tracking-wider mt-1">
                Broker (Dallala) Deductions
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-6 rounded-[24px] text-center shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
              <div className="text-2xl sm:text-3xl font-black text-[#2563EB]">32</div>
              <div className="text-xs text-[#64748B] font-semibold uppercase tracking-wider mt-1">
                Cooperative Union Hubs
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. AI CROP DOCTOR SPOTLIGHT                                               */}
      {/* ========================================================================= */}
      <section className="border-b border-[#E2E8F0]/80 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{t.homeAiDiagnosisTitle}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
                {t.aiDoctorTitle}
              </h2>
              <p className="text-[#334155] text-sm leading-relaxed max-w-xl font-normal">
                {t.aiDoctorDesc}
              </p>

              <div className="grid grid-cols-1 gap-2.5 pt-1 text-xs text-[#334155]">
                <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span>
                    {language === 'am' 
                      ? 'የጤፍና የስንዴ ዝገት፣ የቡና በሽታ እና የበቆሎ ተምችን ወዲያውኑ ይለያል' 
                      : 'Identifies Teff Rust, Wheat Stripe Rust, and Stem Borers instantly.'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span>
                    {language === 'am'
                      ? 'ትክክለኛ የመድሃኒት መጠንና የአጠቃቀም መመሪያ ያዛል'
                      : 'Provides exact active ingredient dosage with safe harvest interval guidelines.'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigateTab('aiDoctor')}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold px-6 py-3 rounded-xl shadow-md transition-all text-sm inline-flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Stethoscope className="w-4 h-4 text-white" />
                  <span>{t.homeBtnScanCrop}</span>
                  <ArrowRight className="w-4 h-4 ml-1 text-white" />
                </button>
              </div>
            </div>

            {/* Interactive Diagnosis Simulation */}
            <div className="lg:col-span-5 bg-white rounded-[24px] p-6 border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)] space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-[#E2E8F0] pb-2.5">
                <span className="font-bold text-[#0F172A]">{t.homeInteractiveDemoTitle}</span>
                <span className={`font-bold px-2 py-0.5 rounded-md border text-[11px] ${activeDemo.badgeColor}`}>
                  {activeDemo.confidence} Confidence
                </span>
              </div>

              {/* Sample Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveDemoSample('teff_rust')}
                  className={`text-xs p-2.5 rounded-xl font-bold transition-all text-center cursor-pointer min-h-[44px] ${
                    activeDemoSample === 'teff_rust'
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-[#F8FAFC] text-[#334155] hover:text-[#0F172A] border border-[#E2E8F0]'
                  }`}
                >
                  🌾 Teff Rust (ጤፍ)
                </button>
                <button
                  onClick={() => setActiveDemoSample('wheat_rust')}
                  className={`text-xs p-2.5 rounded-xl font-bold transition-all text-center cursor-pointer min-h-[44px] ${
                    activeDemoSample === 'wheat_rust'
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-[#F8FAFC] text-[#334155] hover:text-[#0F172A] border border-[#E2E8F0]'
                  }`}
                >
                  🌱 Wheat Rust (ስንዴ)
                </button>
              </div>

              {/* Diagnostic Box */}
              <div className="space-y-2 text-xs bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div className="flex items-baseline justify-between">
                  <span className="text-[#64748B]">{language === 'am' ? 'ሰብል፡' : 'Crop:'}</span>
                  <span className="font-bold text-[#0F172A]">{activeDemo.crop}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[#64748B]">{language === 'am' ? 'በሽታ፡' : 'Pathology:'}</span>
                  <span className="font-bold text-[#EF4444]">{activeDemo.pathology}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[#64748B]">{language === 'am' ? 'መድሃኒት፡' : 'Treatment:'}</span>
                  <span className="font-semibold text-[#2563EB]">{activeDemo.prescription}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[#64748B]">{language === 'am' ? 'አቅርቦት፡' : 'Availability:'}</span>
                  <span className="font-bold text-[#10B981]">{activeDemo.inventory}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('inputs')}
                className="w-full text-center text-xs font-bold py-3 rounded-xl bg-white hover:bg-slate-50 text-[#334155] hover:text-[#2563EB] border border-[#E2E8F0] transition-colors cursor-pointer min-h-[44px]"
              >
                {language === 'am' ? 'የግብዓቶች ካታሎግ ይመልከቱ →' : 'Browse Local Agro-Inputs Catalog →'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FINAL CALL TO ACTION (Single Obvious Next Step)                        */}
      {/* ========================================================================= */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-8 sm:p-12 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              {language === 'am'
                ? 'ምርትዎን ወይም ግብዓትዎን በነፃ ዛሬውኑ ይገበያዩ'
                : 'Start Trading with Zero Risk Today'}
            </h2>
            <p className="text-sm sm:text-base text-[#334155] leading-relaxed font-normal max-w-xl mx-auto">
              {language === 'am'
                ? 'በቴሌብርና በCBE የባንክ ዋስትና ከአርሶ አደሮች፣ ዩኒየኖችና ከተረጋገጡ ነጋዴዎች ጋር በቀጥታ ይገበያዩ።'
                : 'Join thousands of Ethiopian smallholders and cooperative unions trading directly on guaranteed bank escrow.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => onNavigateTab('produce')}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold px-7 py-3.5 rounded-xl shadow-md transition-all text-sm min-h-[44px] inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{language === 'am' ? 'አሁን ይገበያዩ' : 'Start Trading Produce'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <a
                href="tel:8028"
                className="bg-white hover:bg-slate-50 text-[#0F172A] font-semibold px-6 py-3.5 rounded-xl border border-[#E2E8F0] transition-all text-sm min-h-[44px] inline-flex items-center gap-2 shadow-xs"
              >
                <PhoneCall className="w-4 h-4 text-[#2563EB]" />
                <span>Call 8028 (Toll-Free)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
