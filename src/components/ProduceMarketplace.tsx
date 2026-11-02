import React, { useState } from 'react';
import { ProduceListing, User, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { PlusCircle, Search, MapPin, CheckCircle, Volume2, Eye, ShoppingCart, UserCheck } from 'lucide-react';
import { speakMessage } from '../utils/audioGuidance';

interface ProduceMarketplaceProps {
  listings: (ProduceListing & { distanceKm?: number; farmerName?: string; farmerPhone?: string })[];
  currentUser: User;
  language: Language;
  onOrderProduce: (listing: ProduceListing) => void;
  onOpen3D: (modelKey: 'teff' | 'coffee' | 'tractor') => void;
  onAddNewListing: (listingData: any) => void;
}

export const ProduceMarketplace: React.FC<ProduceMarketplaceProps> = ({
  listings,
  currentUser,
  language,
  onOrderProduce,
  onOpen3D,
  onAddNewListing,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [selectedCrop, setSelectedCrop] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New listing form state
  const [newCrop, setNewCrop] = useState('Teff');
  const [newVariety, setNewVariety] = useState('Magna White');
  const [newGrade, setNewGrade] = useState<'Grade 1' | 'Grade 2' | 'Standard'>('Grade 1');
  const [newQuantity, setNewQuantity] = useState('');
  const [newUnit, setNewUnit] = useState('Quintal (100kg)');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const filteredListings = listings.filter((item) => {
    if (selectedCrop !== 'ALL' && item.cropOrLivestock.toLowerCase() !== selectedCrop.toLowerCase()) return false;
    if (selectedGrade !== 'ALL' && item.grade !== selectedGrade) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchCrop = item.cropOrLivestock.toLowerCase().includes(q);
      const matchVar = item.variety.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchWoreda = item.woreda.toLowerCase().includes(q);
      if (!matchCrop && !matchVar && !matchDesc && !matchWoreda) return false;
    }
    return true;
  });

  const handleAudioHelp = () => {
    speakMessage(t.audioHelpProduce, language);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrop || !newPrice || !newQuantity) return;

    onAddNewListing({
      cropOrLivestock: newCrop,
      variety: newVariety,
      grade: newGrade,
      quantity: parseFloat(newQuantity),
      unit: newUnit,
      pricePerUnitEtb: parseFloat(newPrice),
      region: currentUser.region,
      zone: currentUser.zone,
      woreda: currentUser.woreda,
      description: newDesc,
      model3dKey: newCrop.toLowerCase().includes('teff') ? 'teff_sheaf' : newCrop.toLowerCase().includes('coffee') ? 'coffee_branch' : 'teff_sheaf',
    });

    setShowAddModal(false);
    setNewQuantity('');
    setNewPrice('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-[24px] p-6 border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">{t.produceTitle}</h1>
            <button
              onClick={handleAudioHelp}
              className="p-1.5 text-[#2563EB] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
              title="Audio Guidance"
            >
              <Volume2 className="w-5 h-5 text-[#2563EB]" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl font-normal">{t.produceDesc}</p>
        </div>

        {/* Farmer Add Harvest Button */}
        {currentUser.role === 'FARMER' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>{t.listHarvestBtn}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[24px] p-5 border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)] space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search produce (e.g. White Teff, Sidama Coffee, Fogera Onion)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>

          {/* Grade Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#64748B] whitespace-nowrap">{t.gradeLabel}:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="ALL">All Grades</option>
              <option value="Grade 1">Grade 1 (Superior)</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
        </div>

        {/* Crop Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: t.categoryAll },
            { id: 'Teff', label: t.cropTeff },
            { id: 'Coffee', label: t.cropCoffee },
            { id: 'Wheat', label: t.cropWheat },
            { id: 'Onion', label: t.cropOnion },
          ].map((crop) => (
            <button
              key={crop.id}
              onClick={() => setSelectedCrop(crop.id)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCrop === crop.id
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              {crop.label}
            </button>
          ))}
        </div>
      </div>

      {/* Produce Listings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white rounded-[24px] border border-[#E2E8F0] hover:border-blue-400 shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-6 flex flex-col justify-between transition-all duration-300 group"
          >
            <div>
              {/* Clean Metadata: Crop · Grade · Region · Distance */}
              <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-2 font-medium">
                <span className="text-[#2563EB] font-bold">{listing.cropOrLivestock}</span>
                <span aria-hidden="true">·</span>
                <span className="bg-slate-100 text-[#0F172A] px-2 py-0.5 rounded-md font-semibold text-[11px]">{listing.grade}</span>
                <span aria-hidden="true">·</span>
                <span>{listing.woreda}</span>
                {listing.distanceKm !== undefined && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#334155] font-semibold">{listing.distanceKm} km</span>
                  </>
                )}
              </div>

              {/* Title & Variety */}
              <h3 className="text-base font-bold text-[#0F172A] leading-snug group-hover:text-[#2563EB] transition-colors">
                {listing.cropOrLivestock} — {listing.variety}
              </h3>

              {/* Farmer Info */}
              <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Seller: <strong className="text-[#0F172A] font-semibold">{listing.farmerName || 'Smallholder Farmer'}</strong></span>
              </div>

              {/* Description */}
              <p className="text-xs text-[#334155] mt-2 line-clamp-3 leading-relaxed font-normal">
                {listing.description}
              </p>
            </div>

            {/* Price & Quantity & Actions */}
            <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
              <div className="flex items-baseline justify-between mb-3.5">
                <div>
                  <span className="text-2xl font-black text-[#0F172A] tabular-nums">
                    {listing.pricePerUnitEtb.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-[#64748B] ml-1">
                    ETB / {listing.unit}
                  </span>
                </div>

                <div className="text-xs text-[#64748B]">
                  Vol: <strong className="text-[#0F172A] font-bold tabular-nums">{listing.quantity}</strong> {listing.unit}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => onOrderProduce(listing)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 text-white" />
                  <span>{t.makeOfferBtn}</span>
                </button>

                <button
                  onClick={() => {
                    if (listing.cropOrLivestock.toLowerCase().includes('coffee')) onOpen3D('coffee');
                    else onOpen3D('teff');
                  }}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] border border-[#E2E8F0] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4 text-[#2563EB]" />
                  <span>{t.inspect3D}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Farmer Add Produce Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.15)] border border-[#E2E8F0]">
            <h2 className="text-lg font-black text-[#0F172A] mb-1">List Your Harvest Produce</h2>
            <p className="text-xs text-[#64748B] mb-4">Post directly to buyers without middlemen taking your margins.</p>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Commodity / Crop</label>
                  <select
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] text-[#0F172A] font-semibold"
                  >
                    <option value="Teff">Teff (ጤፍ)</option>
                    <option value="Wheat">Bread Wheat (ስንዴ)</option>
                    <option value="Coffee">Specialty Coffee (ቡና)</option>
                    <option value="Maize">Maize (በቆሎ)</option>
                    <option value="Onion">Red Onion (ቀይ ሽንኩርት)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Variety Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Magna White / Serena"
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] text-[#0F172A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Grade</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] text-[#0F172A] font-semibold"
                  >
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] text-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Price (ETB)</label>
                  <input
                    type="number"
                    required
                    placeholder="5400"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] text-[#0F172A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Description & Storage Quality</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Clean double-sieved grain, low moisture, bagged in Ada'a."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] text-[#0F172A]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all"
                >
                  Post Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
