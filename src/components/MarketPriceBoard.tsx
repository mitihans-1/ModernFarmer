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
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">{t.priceBoardTitle}</h1>
            <button
              onClick={handleReadAll}
              className="p-1 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Read price board aloud"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">{t.priceBoardDesc}</p>
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
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCommodity === c.id
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Middleman Protection Guidance Callout */}
      <div className="bg-emerald-950 text-emerald-100 rounded-2xl p-4 border border-emerald-900 flex items-start gap-3 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="font-semibold text-emerald-300 block mb-0.5">
            {language === 'am' ? 'የገበሬዎች መከላከያ ምክር፡' : language === 'om' ? 'Gorsa Qonnaan Bulaa:' : 'Fair Market Protection Notice:'}
          </strong>
          {language === 'am'
            ? 'አካባቢዎ ያሉ ደላላዎች ከገበያው ዋጋ በታች እንዳያስገድዱዎት እዚህ የተገለጸውን የቢሾፍቱ እና የመርካቶ ዋጋ እንደ መነሻ ይጠቀሙ።'
            : language === 'om'
            ? 'Dallaltoonni gatii gabaa gadiin akka isin hin miine gatii gabaa Ada’aa fi Finfinnee qoradhaa.'
            : 'Check these real-time terminal prices before negotiating with village brokers to ensure you receive true market value for your harvest.'}
        </div>
      </div>

      {/* Price Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((report) => {
          const isUp = report.trend === 'UP';
          const isDown = report.trend === 'DOWN';

          return (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header: Market & Region · Audio Button */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                      {report.region} · {report.unit}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 leading-snug">
                      {report.commodity}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleReadReport(report)}
                    className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer shrink-0"
                    title={t.readAloudBtn}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Market Name */}
                <p className="text-xs text-stone-600 mb-4 font-medium">
                  Market: <span className="text-stone-800">{report.marketName}</span>
                </p>

                {/* Main Benchmark Price & Trend Indicator */}
                <div className="flex items-baseline justify-between bg-stone-50 p-3 rounded-xl border border-stone-100 mb-4">
                  <div>
                    <span className="text-[11px] text-stone-500 font-medium block">{t.avgPrice}</span>
                    <span className="text-2xl font-black text-stone-900 tabular-nums">
                      {report.avgPriceEtb.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-stone-600 ml-1">ETB</span>
                  </div>

                  {/* Clean unboxed trend */}
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    {isUp && (
                      <span className="text-emerald-700 flex items-center gap-0.5">
                        <TrendingUp className="w-4 h-4" /> +{report.changePct}%
                      </span>
                    )}
                    {isDown && (
                      <span className="text-rose-700 flex items-center gap-0.5">
                        <TrendingDown className="w-4 h-4" /> {report.changePct}%
                      </span>
                    )}
                    {!isUp && !isDown && (
                      <span className="text-stone-600 flex items-center gap-0.5">
                        <Minus className="w-4 h-4" /> Stable
                      </span>
                    )}
                  </div>
                </div>

                {/* Range: Min / Max */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                    <span className="text-[10px] text-stone-500 block uppercase font-medium">{t.minPrice}</span>
                    <span className="font-bold text-stone-800 tabular-nums">{report.minPriceEtb.toLocaleString()} ETB</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                    <span className="text-[10px] text-stone-500 block uppercase font-medium">{t.maxPrice}</span>
                    <span className="font-bold text-stone-800 tabular-nums">{report.maxPriceEtb.toLocaleString()} ETB</span>
                  </div>
                </div>

                {/* Mini SVG Sparkline Trend */}
                {report.history && report.history.length > 1 && (
                  <div className="pt-2">
                    <span className="text-[10px] text-stone-500 font-medium block mb-1.5">7-Day Trend</span>
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
                                idx === report.history.length - 1 ? 'bg-emerald-600' : 'bg-stone-300'
                              }`}
                            />
                            <span className="text-[9px] text-stone-400 tabular-nums">
                              {pt.date.split('-').slice(1).join('/')}
                            </span>
                            {/* Hover tooltip */}
                            <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
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
