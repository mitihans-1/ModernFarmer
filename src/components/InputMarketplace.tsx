import React, { useState } from 'react';
import { Product, User, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { Search, MapPin, ShieldCheck, Box, Eye, ShoppingCart, Volume2, PlusCircle, CheckCircle2 } from 'lucide-react';
import { speakMessage } from '../utils/audioGuidance';

interface InputMarketplaceProps {
  products: (Product & { distanceKm?: number })[];
  currentUser: User;
  language: Language;
  onOrderProduct: (product: Product) => void;
  onOpen3D: (modelKey: 'teff' | 'coffee' | 'tractor') => void;
  onAddNewProduct?: (productData: any) => void;
}

export const InputMarketplace: React.FC<InputMarketplaceProps> = ({
  products,
  currentUser,
  language,
  onOrderProduct,
  onOpen3D,
  onAddNewProduct,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number>(500);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New product form state for suppliers
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'FERTILIZER' | 'SEED' | 'PESTICIDE' | 'TOOLS_PPE'>('FERTILIZER');
  const [newPrice, setNewPrice] = useState('');
  const [newUnit, setNewUnit] = useState('50kg Bag');
  const [newStock, setNewStock] = useState('50');
  const [newDesc, setNewDesc] = useState('');
  const [newSubsidized, setNewSubsidized] = useState(false);

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (p.distanceKm && p.distanceKm > maxDistance) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchBrand = p.brandOrVariety.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchAm = p.titleAm && p.titleAm.includes(q);
      const matchOm = p.titleOm && p.titleOm.toLowerCase().includes(q);
      if (!matchTitle && !matchBrand && !matchDesc && !matchAm && !matchOm) return false;
    }
    return true;
  });

  const handleAudioHelp = () => {
    speakMessage(t.audioHelpInputs, language);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;
    if (onAddNewProduct) {
      onAddNewProduct({
        category: newCategory,
        title: newTitle,
        description: newDesc,
        brandOrVariety: 'Quality Standard',
        priceEtb: parseFloat(newPrice),
        unit: newUnit,
        stockQuantity: parseInt(newStock, 10),
        isSubsidizedCoop: newSubsidized,
        region: currentUser.region,
        woreda: currentUser.woreda,
        model3dKey: newCategory === 'TOOLS_PPE' ? 'sprayer' : 'fertilizer_bag',
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewPrice('');
      setNewDesc('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Accessibility Bar */}
      <div className="bg-white rounded-[24px] p-6 border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">{t.inputsTitle}</h1>
            <button
              onClick={handleAudioHelp}
              className="p-1.5 text-[#2563EB] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
              title="Listen to overview"
            >
              <Volume2 className="w-5 h-5 text-[#2563EB]" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl font-normal">{t.inputsDesc}</p>
        </div>

        {/* Supplier Add Product Button */}
        {currentUser.role === 'SUPPLIER' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Add Input Inventory</span>
          </button>
        )}
      </div>

      {/* Search & Filtering Controls */}
      <div className="bg-white rounded-[24px] p-5 border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)] space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchInputsPlaceholder}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>

          {/* Distance Proximity Filter */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#334155]">
            <MapPin className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span className="whitespace-nowrap font-semibold">Within {maxDistance} km</span>
            <input
              type="range"
              min="20"
              max="600"
              step="20"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value, 10))}
              className="w-24 accent-[#2563EB] cursor-pointer"
            />
          </div>
        </div>

        {/* Category Filter Tabs (Single-line interactive controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: t.categoryAll },
            { id: 'FERTILIZER', label: t.categoryFertilizer },
            { id: 'SEED', label: t.categorySeed },
            { id: 'PESTICIDE', label: t.categoryPesticide },
            { id: 'TOOLS_PPE', label: t.categoryToolsPPE },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const itemTitle =
            language === 'am' && product.titleAm
              ? product.titleAm
              : language === 'om' && product.titleOm
              ? product.titleOm
              : product.title;

          return (
            <div
              key={product.id}
              className="bg-white rounded-[24px] border border-[#E2E8F0] hover:border-blue-400 shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-6 flex flex-col justify-between transition-all duration-300 group"
            >
              <div>
                {/* Clean Metadata: Category · Subsidized · Distance */}
                <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-2 font-medium">
                  <span className="text-[#2563EB] font-bold">{product.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{product.woreda}</span>
                  {product.distanceKm !== undefined && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#334155] font-semibold">
                        {product.distanceKm} {t.distanceAway}
                      </span>
                    </>
                  )}
                </div>

                {/* Subsidized Coop Notice */}
                {product.isSubsidizedCoop && (
                  <div className="mb-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#10B981] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>{t.subsidizedGovBadge}</span>
                  </div>
                )}

                {/* Product Title */}
                <h3 className="text-base font-bold text-[#0F172A] leading-snug group-hover:text-[#2563EB] transition-colors">
                  {itemTitle}
                </h3>

                {/* Brand / Research Variety */}
                <p className="text-xs text-[#64748B] mt-1 font-medium">
                  Variety: <span className="font-semibold text-[#0F172A]">{product.brandOrVariety}</span>
                </p>

                {/* Description */}
                <p className="text-xs text-[#334155] mt-2 line-clamp-3 leading-relaxed font-normal">
                  {product.description}
                </p>
              </div>

              {/* Price & Stock & Action Row */}
              <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
                <div className="flex items-baseline justify-between mb-3.5">
                  <div>
                    <span className="text-2xl font-black text-[#0F172A] tabular-nums">
                      {product.priceEtb.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-[#64748B] ml-1">
                      {t.priceUnit} / {product.unit}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#64748B] flex items-center gap-1 font-medium">
                    <Box className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span className="tabular-nums font-bold text-[#0F172A]">{product.stockQuantity}</span> {t.stockAvailable}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onOrderProduct(product)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-white" />
                    <span>{t.orderNow}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (product.category === 'SEED') onOpen3D('teff');
                      else if (product.category === 'TOOLS_PPE') onOpen3D('tractor');
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
          );
        })}
      </div>

      {/* Supplier Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.15)] border border-[#E2E8F0]">
            <h2 className="text-lg font-black text-[#0F172A] mb-1">Add Input Inventory Item</h2>
            <p className="text-xs text-[#64748B] mb-4">Register fertilizer, seeds, or agro-tools for farmers in your woreda.</p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Product Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] text-[#0F172A] font-semibold"
                >
                  <option value="FERTILIZER">Fertilizer (Urea, NPS, DAP)</option>
                  <option value="SEED">Certified Seed</option>
                  <option value="PESTICIDE">Crop Protection / Pesticide</option>
                  <option value="TOOLS_PPE">Tools, Sprayers & PPE Clothing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Certified Teff Seed - DZ-Cr-37 (Magna)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] text-[#0F172A]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Price (ETB)</label>
                  <input
                    type="number"
                    required
                    placeholder="4500"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="50kg Bag"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] text-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] text-[#0F172A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Description & Storage Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Details regarding germination rate, soil type or safety..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs bg-[#F8FAFC] text-[#0F172A]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="subsidized"
                  checked={newSubsidized}
                  onChange={(e) => setNewSubsidized(e.target.checked)}
                  className="w-4 h-4 accent-[#2563EB] rounded"
                />
                <label htmlFor="subsidized" className="text-xs font-medium text-[#334155]">
                  Subsidized Cooperative Allocation (requires membership validation)
                </label>
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
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
