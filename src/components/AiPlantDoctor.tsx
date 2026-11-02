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
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              {t.aiDoctorTitle}
            </h1>
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-emerald-700" />
            <span>Audio Help</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image Input & Quick Samples (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-700" />
              <span>Step 1: Take Photo or Upload Image</span>
            </h2>

            {/* Image Preview / Drop Zone */}
            <div className="relative w-full h-52 rounded-2xl bg-stone-900 border-2 border-dashed border-stone-300 overflow-hidden flex items-center justify-center group">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Affected Crop"
                  className="w-full h-full object-contain bg-stone-950"
                />
              ) : (
                <div className="text-center p-4">
                  <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs text-stone-500 font-medium">
                    Tap below to snap a photo with your mobile camera
                  </p>
                </div>
              )}

              {/* Overlay Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-3 bg-stone-900/90 hover:bg-stone-800 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition-all"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
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
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                Or Select an Ethiopian Crop Case:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {SAMPLE_DIAGNOSES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/50 text-left text-xs font-medium text-stone-800 transition-all cursor-pointer"
                  >
                    <span>{sample.title}</span>
                    <span className="text-[10px] text-stone-500">{sample.crop.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Farmer Notes Input */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Describe Symptoms (Optional)
              </label>
              <textarea
                rows={2}
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g. Orange spots on leaf tips, yellowing stalks in East Shewa..."
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleRunDiagnosis}
              disabled={isDiagnosing}
              className="w-full min-h-[48px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isDiagnosing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini AI Analyzing Crop Pathology...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Diagnose Affected Plant with AI</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-900 border border-rose-200 text-xs font-medium">
                {errorMsg}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Diagnostic & Medicine Prescription (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!diagnosis && !isDiagnosing && (
            <div className="bg-white rounded-2xl p-10 border border-stone-200 shadow-sm text-center text-stone-500 space-y-3">
              <Pill className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-800">
                Awaiting Plant Photo
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Take a photo of your damaged leaves, stems, or berries on the left and tap &ldquo;Diagnose Affected Plant with AI&rdquo;. The agronomist AI will identify the specific Ethiopian disease and prescribe approved local fungicides or pesticides.
              </p>
            </div>
          )}

          {isDiagnosing && (
            <div className="bg-white rounded-2xl p-12 border border-stone-200 shadow-sm text-center space-y-4">
              <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-base font-bold text-stone-900">
                Consulting Ethiopian Crop Pathology Models...
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Cross-referencing symptoms with Ministry of Agriculture pest databases and Ethiopian Institute of Agricultural Research guidelines.
              </p>
            </div>
          )}

          {diagnosis && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-md space-y-5 animate-in fade-in duration-300">
              {/* Top Result Banner */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      {diagnosis.cropIdentified}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        diagnosis.severity === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : diagnosis.severity === 'MODERATE'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {diagnosis.severity} SEVERITY
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold text-stone-900 leading-tight">
                    {language === 'am'
                      ? diagnosis.issueNameAm
                      : language === 'om'
                      ? diagnosis.issueNameOm
                      : diagnosis.issueName}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Scientific / Common: <span className="font-medium text-stone-700">{diagnosis.issueName}</span>
                  </p>
                </div>

                <button
                  onClick={handleReadDiagnosis}
                  className="p-2 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Listen to diagnosis"
                >
                  <Volume2 className="w-5 h-5 text-emerald-700" />
                </button>
              </div>

              {/* Symptoms & Pathology */}
              <div className="space-y-1.5 text-xs text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-100">
                <span className="font-bold text-stone-900 block">
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
              <div className="space-y-1.5 text-xs text-stone-700 leading-relaxed">
                <span className="font-bold text-stone-900 block">
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
              <div className="bg-emerald-950 text-emerald-50 rounded-2xl p-5 border border-emerald-900 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                        Prescribed Medicine / Agrochemical
                      </span>
                      <h3 className="text-base font-bold text-white leading-tight">
                        {diagnosis.recommendedMedicine.medicineName}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 block font-medium">Estimated Price</span>
                    <span className="text-lg font-black text-white tabular-nums">
                      {diagnosis.recommendedMedicine.matchedProductPriceEtb?.toLocaleString() || '850'}
                    </span>
                    <span className="text-xs text-emerald-300 ml-1">ETB</span>
                  </div>
                </div>

                <div className="text-xs text-emerald-200 leading-relaxed bg-emerald-900/60 p-3 rounded-xl border border-emerald-800/80">
                  <span className="font-bold text-emerald-100 block mb-0.5">
                    Dosage & Application Instructions:
                  </span>
                  {diagnosis.recommendedMedicine.dosageInstructions}
                </div>

                {/* Instant Order Button */}
                {matchedCatalogProduct ? (
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-emerald-900/80">
                    <div className="text-[11px] text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>In Stock at {matchedCatalogProduct.woreda} Agro-Hub ({matchedCatalogProduct.stockQuantity} available)</span>
                    </div>

                    <button
                      onClick={() => onOrderMedicine(matchedCatalogProduct)}
                      className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
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
                      className="w-full min-h-[46px] px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{t.orderMedicineBtn}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Preventative Measures Note */}
              <div className="text-[11px] text-stone-500 leading-relaxed flex items-start gap-1.5 pt-1">
                <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
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
