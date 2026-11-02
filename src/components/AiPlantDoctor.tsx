import React, { useState, useRef } from 'react';
import { PlantDiagnosisResult, Product, User, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { speakMessage } from '../utils/audioGuidance';
import {
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Volume2,
  ShoppingCart,
  Pill,
  ShieldCheck,
  RefreshCw,
  Info,
} from 'lucide-react';

interface AiPlantDoctorProps {
  currentUser: User;
  language: Language;
  products: Product[];
  onOrderMedicine: (product: Product) => void;
}

// Built-in high-quality SVG/canvas samples for Ethiopian crop diseases
const SAMPLE_DIAGNOSES = [
  {
    id: 'sample-teff-rust',
    title: '🌾 Teff Leaf Rust',
    crop: 'Teff (DZ-Cr-37 Magna)',
    color: 'from-amber-700 via-amber-600 to-amber-900',
    notes: 'Leaves showing orange-brown pustules, tips drying up in Ada’a woreda.',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%232b401d"/><path d="M50,180 Q100,50 250,20" stroke="%238a9e47" stroke-width="24" fill="none"/><circle cx="110" cy="110" r="14" fill="%23c26715"/><circle cx="150" cy="80" r="18" fill="%23d97706"/><circle cx="180" cy="55" r="12" fill="%23b45309"/><circle cx="130" cy="95" r="10" fill="%23d97706"/><text x="150" y="185" fill="%23ffffff" font-size="14" text-anchor="middle" font-family="sans-serif">Teff Leaf Rust Sample</text></svg>',
  },
  {
    id: 'sample-coffee-cbd',
    title: '☕ Coffee Berry Disease',
    crop: 'Specialty Coffee (Sidama Arabica)',
    color: 'from-emerald-950 via-stone-800 to-red-950',
    notes: 'Green coffee berries turning black and dropping prematurely in Aleta Wondo.',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%231e2d1d"/><line x1="20" y1="100" x2="280" y2="100" stroke="%234a3525" stroke-width="14"/><circle cx="100" cy="85" r="28" fill="%23194a20"/><circle cx="95" cy="80" r="16" fill="%231a1a1a"/><circle cx="160" cy="115" r="30" fill="%2324140e"/><circle cx="210" cy="80" r="26" fill="%23801217"/><circle cx="218" cy="88" r="12" fill="%23111111"/><text x="150" y="185" fill="%23ffffff" font-size="14" text-anchor="middle" font-family="sans-serif">Coffee Berry Disease Sample</text></svg>',
  },
  {
    id: 'sample-stem-borer',
    title: '🐛 Cereal Stem Borer / Aphids',
    crop: 'Cereal Crop (Maize / Teff)',
    color: 'from-amber-900 via-stone-900 to-emerald-900',
    notes: 'Larvae boring holes in lower stalk, sticky honeydew aphids on underside of leaves.',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23283618"/><rect x="120" y="20" width="60" height="160" rx="8" fill="%23606c38"/><ellipse cx="150" cy="80" rx="14" ry="10" fill="%2328170c"/><ellipse cx="145" cy="120" rx="12" ry="8" fill="%2328170c"/><text x="150" y="185" fill="%23ffffff" font-size="14" text-anchor="middle" font-family="sans-serif">Stem Borer Infestation Sample</text></svg>',
  },
];

export const AiPlantDoctor: React.FC<AiPlantDoctorProps> = ({
  currentUser,
  language,
  products,
  onOrderMedicine,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(SAMPLE_DIAGNOSES[0].dataUrl);
  const [mimeType, setMimeType] = useState<string>('image/svg+xml');
  const [userNotes, setUserNotes] = useState<string>(SAMPLE_DIAGNOSES[0].notes);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<PlantDiagnosisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle image upload from camera or local file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setDiagnosis(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: (typeof SAMPLE_DIAGNOSES)[0]) => {
    setImagePreview(sample.dataUrl);
    setMimeType('image/svg+xml');
    setUserNotes(sample.notes);
    setDiagnosis(null);
    setErrorMsg(null);
  };

  const handleRunDiagnosis = async () => {
    if (!imagePreview) {
      setErrorMsg('Please upload or select an affected plant image first.');
      return;
    }

    setIsDiagnosing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/diagnose-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType,
          userNotes,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: PlantDiagnosisResult = await res.json();
      setDiagnosis(data);

      // Spoken voice guidance announcement
      const speechText =
        language === 'am'
          ? `የተገኘው በሽታ፡ ${data.issueNameAm} ነው። የተመከረው መድሃኒት፡ ${data.recommendedMedicine.medicineName} ነው።`
          : language === 'om'
          ? `Dhukkubni adda ba’e: ${data.issueNameOm}. Qorichi filatame: ${data.recommendedMedicine.medicineName}.`
          : `Diagnosed: ${data.issueName}. Recommended treatment: ${data.recommendedMedicine.medicineName}.`;
      speakMessage(speechText, language);
    } catch (err: any) {
      console.error('Diagnosis request error:', err);
      setErrorMsg('Could not analyze photo. Please check network connection or try again.');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleReadDiagnosis = () => {
    if (!diagnosis) return;
    const text =
      language === 'am'
        ? `የሰብል ምርመራ ውጤት፡ ${diagnosis.cropIdentified}። በሽታው፡ ${diagnosis.issueNameAm}። ህክምና፡ ${diagnosis.treatmentAdviceAm || diagnosis.treatmentAdvice}። መድሃኒት፡ ${diagnosis.recommendedMedicine.medicineName}። የአጠቃቀም መመሪያ፡ ${diagnosis.recommendedMedicine.dosageInstructions}`
        : language === 'om'
        ? `Bu’aa qorannoo: ${diagnosis.cropIdentified}. Dhukkuba: ${diagnosis.issueNameOm}. Qoricha: ${diagnosis.recommendedMedicine.medicineName}. Akkaataa itti fayyadamaa: ${diagnosis.recommendedMedicine.dosageInstructions}`
        : `Crop identified: ${diagnosis.cropIdentified}. Pathology: ${diagnosis.issueName}. Severity: ${diagnosis.severity}. Recommended Medicine: ${diagnosis.recommendedMedicine.medicineName}. Dosage instructions: ${diagnosis.recommendedMedicine.dosageInstructions}`;
    speakMessage(text, language);
  };

  // Find matching product in catalog to allow 1-click purchase
  const matchedCatalogProduct = diagnosis?.recommendedMedicine.matchedProductId
    ? products.find((p) => p.id === diagnosis.recommendedMedicine.matchedProductId)
    : products.find((p) => p.category === 'PESTICIDE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[24px] p-6 border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
              {t.aiDoctorTitle}
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1.5 max-w-2xl leading-relaxed">
            {t.aiDoctorDesc}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              speakMessage(
                language === 'am'
                  ? 'የታመመውን ቅጠል ፎቶ ያንሱ፤ አርቴፊሻል ኢንተለጀንስ በሽታውን ለይቶ መድሃኒት ያዛል።'
                  : language === 'om'
                  ? 'Suuraa biqiltuu dhukkubsatee kaasaa; AI dhukkuba adda baasee qoricha kenna.'
                  : 'Take a photo of your affected crop. Gemini AI diagnoses the disease and links directly to buyable medicine.',
                language
              );
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] border border-[#E2E8F0] font-semibold text-xs transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[#2563EB]" />
            <span>Audio Help</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image Input & Quick Samples (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-[24px] p-6 border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)] space-y-4">
            <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#2563EB]" />
              <span>Step 1: Take Photo or Upload Image</span>
            </h2>

            {/* Image Preview / Drop Zone */}
            <div className="relative w-full h-52 rounded-[20px] bg-slate-900 border-2 border-dashed border-[#CBD5E1] overflow-hidden flex items-center justify-center group">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Affected Crop"
                  className="w-full h-full object-contain bg-slate-950"
                />
              ) : (
                <div className="text-center p-4">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">
                    Tap below to snap a photo with your mobile camera
                  </p>
                </div>
              )}

              {/* Overlay Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-3 bg-[#0F172A]/90 hover:bg-[#0F172A] text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition-all"
              >
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span>Change Photo</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Quick Ethiopian Test Case Presets */}
            <div>
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2">
                Or Select an Ethiopian Crop Case:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {SAMPLE_DIAGNOSES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#2563EB] hover:bg-blue-50/50 text-left text-xs font-medium text-[#0F172A] transition-all cursor-pointer"
                  >
                    <span>{sample.title}</span>
                    <span className="text-[10px] text-[#64748B]">{sample.crop.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Farmer Notes Input */}
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                Describe Symptoms (Optional)
              </label>
              <textarea
                rows={2}
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g. Orange spots on leaf tips, yellowing stalks in East Shewa..."
                className="w-full p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleRunDiagnosis}
              disabled={isDiagnosing}
              className="w-full min-h-[48px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isDiagnosing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini AI Analyzing Crop Pathology...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Diagnose Affected Plant with AI</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-[#EF4444] border border-red-200 text-xs font-medium">
                {errorMsg}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Diagnostic & Medicine Prescription (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!diagnosis && !isDiagnosing && (
            <div className="bg-white rounded-[24px] p-10 border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)] text-center text-[#64748B] space-y-3">
              <Pill className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-[#0F172A]">
                Awaiting Plant Photo
              </h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
                Take a photo of your damaged leaves, stems, or berries on the left and tap &ldquo;Diagnose Affected Plant with AI&rdquo;. The agronomist AI will identify the specific Ethiopian disease and prescribe approved local fungicides or pesticides.
              </p>
            </div>
          )}

          {isDiagnosing && (
            <div className="bg-white rounded-[24px] p-12 border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)] text-center space-y-4">
              <div className="w-10 h-10 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-base font-bold text-[#0F172A]">
                Consulting Ethiopian Crop Pathology Models...
              </h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Cross-referencing symptoms with Ministry of Agriculture pest databases and Ethiopian Institute of Agricultural Research guidelines.
              </p>
            </div>
          )}

          {diagnosis && (
            <div className="bg-white rounded-[24px] p-6 border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)] space-y-5 animate-in fade-in duration-300">
              {/* Top Result Banner */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                      {diagnosis.cropIdentified}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        diagnosis.severity === 'HIGH'
                          ? 'bg-red-50 text-[#EF4444] border border-red-200'
                          : diagnosis.severity === 'MODERATE'
                          ? 'bg-amber-50 text-[#F59E0B] border border-amber-200'
                          : 'bg-emerald-50 text-[#10B981] border border-emerald-200'
                      }`}
                    >
                      {diagnosis.severity} SEVERITY
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold text-[#0F172A] leading-tight">
                    {language === 'am'
                      ? diagnosis.issueNameAm
                      : language === 'om'
                      ? diagnosis.issueNameOm
                      : diagnosis.issueName}
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1">
                    Scientific / Common: <span className="font-medium text-[#334155]">{diagnosis.issueName}</span>
                  </p>
                </div>

                <button
                  onClick={handleReadDiagnosis}
                  className="p-2.5 text-[#64748B] hover:text-[#2563EB] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Listen to diagnosis"
                >
                  <Volume2 className="w-5 h-5 text-[#2563EB]" />
                </button>
              </div>

              {/* Symptoms & Pathology */}
              <div className="space-y-1.5 text-xs text-[#334155] leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <span className="font-bold text-[#0F172A] block">
                  Observed Pathology & Symptoms:
                </span>
                <p>
                  {language === 'am' && diagnosis.symptomsAm
                    ? diagnosis.symptomsAm
                    : language === 'om' && diagnosis.symptomsOm
                    ? diagnosis.symptomsOm
                    : diagnosis.symptoms}
                </p>
              </div>

              {/* Treatment Advice */}
              <div className="space-y-1.5 text-xs text-[#334155] leading-relaxed">
                <span className="font-bold text-[#0F172A] block">
                  Agronomic Treatment Strategy:
                </span>
                <p>
                  {language === 'am' && diagnosis.treatmentAdviceAm
                    ? diagnosis.treatmentAdviceAm
                    : language === 'om' && diagnosis.treatmentAdviceOm
                    ? diagnosis.treatmentAdviceOm
                    : diagnosis.treatmentAdvice}
                </p>
              </div>

              {/* Recommended Medicine & Instant Order Box */}
              <div className="bg-[#0F172A] text-white rounded-[20px] p-5 border border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">
                        Prescribed Medicine / Agrochemical
                      </span>
                      <h3 className="text-base font-bold text-white leading-tight">
                        {diagnosis.recommendedMedicine.medicineName}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Estimated Price</span>
                    <span className="text-lg font-black text-white tabular-nums">
                      {diagnosis.recommendedMedicine.matchedProductPriceEtb?.toLocaleString() || '850'}
                    </span>
                    <span className="text-xs text-blue-400 ml-1">ETB</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80">
                  <span className="font-bold text-white block mb-0.5">
                    Dosage & Application Instructions:
                  </span>
                  {diagnosis.recommendedMedicine.dosageInstructions}
                </div>

                {/* Instant Order Button */}
                {matchedCatalogProduct ? (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                    <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>In Stock at {matchedCatalogProduct.woreda} Agro-Hub ({matchedCatalogProduct.stockQuantity} available)</span>
                    </div>

                    <button
                      onClick={() => onOrderMedicine(matchedCatalogProduct)}
                      className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{t.orderMedicineBtn}</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        const fallbackProd = products.find((p) => p.category === 'PESTICIDE') || products[0];
                        onOrderMedicine(fallbackProd);
                      }}
                      className="w-full min-h-[46px] px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{t.orderMedicineBtn}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Preventative Measures Note */}
              <div className="text-[11px] text-[#64748B] leading-relaxed flex items-start gap-1.5 pt-1">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Long-term prevention:</strong> {diagnosis.preventativeMeasures}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
