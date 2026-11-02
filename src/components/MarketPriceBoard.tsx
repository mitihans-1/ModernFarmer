import React, { useState } from 'react';
import { PriceReport, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { TrendingUp, TrendingDown, Minus, Volume2, ShieldAlert } from 'lucide-react';
import { speakMessage } from '../utils/audioGuidance';

interface MarketPriceBoardProps {
  priceReports: PriceReport[];
  language: Language;
}

export const MarketPriceBoard: React.FC<MarketPriceBoardProps> = ({ priceReports, language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [selectedCommodity, setSelectedCommodity] = useState<string>('ALL');

  const filteredReports = priceReports.filter((report) => {
    if (selectedCommodity !== 'ALL' && !report.commodity.toLowerCase().includes(selectedCommodity.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleReadReport = (report: PriceReport) => {
    let msg = '';
    if (language === 'am') {
      msg = `${report.commodity} በ${report.marketName} አማካይ ዋጋ ${report.avgPriceEtb} ብር በኩንታል ነው። አነስተኛ ዋጋ ${report.minPriceEtb}፣ ከፍተኛ ዋጋ ${report.maxPriceEtb} ብር ነው።`;
    } else if (language === 'om') {
      msg = `Gatiin giddu-galeessaa ${report.commodity} gabaa ${report.marketName} keessatti qarshii ${report.avgPriceEtb} dha.`;
    } else {
      msg = `${report.commodity} at ${report.marketName}: average price is ${report.avgPriceEtb} ETB per ${report.unit}.`;
    }
    speakMessage(msg, language);
  };

  const handleReadAll = () => {
    speakMessage(t.audioHelpPrices, language);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-[24px] p-6 border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">{t.priceBoardTitle}</h1>
            <button
              onClick={handleReadAll}
              className="p-1.5 text-[#2563EB] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
              title="Read price board aloud"
            >
              <Volume2 className="w-5 h-5 text-[#2563EB]" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl font-normal">{t.priceBoardDesc}</p>
        </div>

        {/* Commodity Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs shrink-0">
          {[
            { id: 'ALL', label: 'All Commodities' },
            { id: 'Teff', label: 'Teff' },
            { id: 'Coffee', label: 'Coffee' },
            { id: 'Wheat', label: 'Wheat' },
            { id: 'Onion', label: 'Onion' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCommodity(c.id)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCommodity === c.id
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Middleman Protection Guidance Callout */}
      <div className="bg-blue-50/80 text-[#0F172A] rounded-[24px] p-5 border border-blue-200 flex items-start gap-3.5 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="font-bold text-[#0F172A] block mb-0.5 text-xs sm:text-sm">
            {language === 'am' ? 'የገበሬዎች መከላከያ ምክር፡' : language === 'om' ? 'Gorsa Qonnaan Bulaa:' : 'Fair Market Protection Notice:'}
          </strong>
          <span className="text-[#334155]">
            {language === 'am'
              ? 'አካባቢዎ ያሉ ደላላዎች ከገበያው ዋጋ በታች እንዳያስገድዱዎት እዚህ የተገለጸውን የቢሾፍቱ እና የመርካቶ ዋጋ እንደ መነሻ ይጠቀሙ።'
              : language === 'om'
              ? 'Dallaltoonni gatii gabaa gadiin akka isin hin miine gatii gabaa Ada’aa fi Finfinnee qoradhaa.'
              : 'Check these real-time terminal prices before negotiating with village brokers to ensure you receive true market value for your harvest.'}
          </span>
        </div>
      </div>

      {/* Price Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => {
          const isUp = report.trend === 'UP';
          const isDown = report.trend === 'DOWN';

          return (
            <div
              key={report.id}
              className="bg-white rounded-[24px] border border-[#E2E8F0] hover:border-blue-400 shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-6 flex flex-col justify-between transition-all duration-300 group"
            >
              <div>
                {/* Header: Market & Region · Audio Button */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                      {report.region} · {report.unit}
                    </span>
                    <h3 className="text-base font-bold text-[#0F172A] leading-snug group-hover:text-[#2563EB] transition-colors">
                      {report.commodity}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleReadReport(report)}
                    className="p-1.5 text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer shrink-0"
                    title={t.readAloudBtn}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Market Name */}
                <p className="text-xs text-[#64748B] mb-4 font-medium">
                  Market: <span className="text-[#0F172A] font-semibold">{report.marketName}</span>
                </p>

                {/* Main Benchmark Price & Trend Indicator */}
                <div className="flex items-baseline justify-between bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] mb-4">
                  <div>
                    <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block">{t.avgPrice}</span>
                    <span className="text-2xl font-black text-[#0F172A] tabular-nums">
                      {report.avgPriceEtb.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-[#64748B] ml-1">ETB</span>
                  </div>

                  {/* Clean unboxed trend */}
                  <div className="flex items-center gap-1 text-xs font-bold">
                    {isUp && (
                      <span className="bg-emerald-50 text-[#10B981] border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <TrendingUp className="w-3.5 h-3.5" /> +{report.changePct}%
                      </span>
                    )}
                    {isDown && (
                      <span className="bg-red-50 text-[#EF4444] border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <TrendingDown className="w-3.5 h-3.5" /> {report.changePct}%
                      </span>
                    )}
                    {!isUp && !isDown && (
                      <span className="bg-slate-100 text-[#64748B] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Minus className="w-3.5 h-3.5" /> Stable
                      </span>
                    )}
                  </div>
                </div>

                {/* Range: Min / Max */}
                <div className="grid grid-cols-2 gap-2.5 text-xs mb-4">
                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] block uppercase font-bold">{t.minPrice}</span>
                    <span className="font-extrabold text-[#0F172A] tabular-nums">{report.minPriceEtb.toLocaleString()} ETB</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-[10px] text-[#64748B] block uppercase font-bold">{t.maxPrice}</span>
                    <span className="font-extrabold text-[#0F172A] tabular-nums">{report.maxPriceEtb.toLocaleString()} ETB</span>
                  </div>
                </div>

                {/* Mini SVG Sparkline Trend */}
                {report.history && report.history.length > 1 && (
                  <div className="pt-2">
                    <span className="text-[10px] text-[#64748B] font-bold block mb-1.5 uppercase tracking-wider">7-Day Trend</span>
                    <div className="h-10 w-full flex items-end gap-1.5">
                      {report.history.map((pt, idx) => {
                        const min = Math.min(...report.history.map((h) => h.avgPriceEtb));
                        const max = Math.max(...report.history.map((h) => h.avgPriceEtb));
                        const range = max - min || 1;
                        const heightPct = Math.max(15, Math.min(100, ((pt.avgPriceEtb - min) / range) * 80 + 20));

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div
                              style={{ height: `${heightPct}%` }}
                              className={`w-full rounded-t transition-all ${
                                idx === report.history.length - 1 ? 'bg-[#2563EB]' : 'bg-slate-200 group-hover:bg-blue-300'
                              }`}
                            />
                            <span className="text-[9px] text-[#94A3B8] tabular-nums font-semibold">
                              {pt.date.split('-').slice(1).join('/')}
                            </span>
                            {/* Hover tooltip */}
                            <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] text-white text-[10px] px-2 py-0.5 rounded-lg shadow-md pointer-events-none whitespace-nowrap z-10 font-bold">
                              {pt.avgPriceEtb} ETB
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
