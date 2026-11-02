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
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">{t.inputsTitle}</h1>
            <button
              onClick={handleAudioHelp}
              className="p-1 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Listen to overview"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">{t.inputsDesc}</p>
        </div>

        {/* Supplier Add Product Button */}
        {currentUser.role === 'SUPPLIER' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 font-semibold text-xs shadow-sm transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Input Inventory</span>
          </button>
        )}
      </div>

      {/* Search & Filtering Controls */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchInputsPlaceholder}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 text-stone-900 placeholder:text-stone-400"
            />
          </div>

          {/* Distance Proximity Filter */}
          <div className="flex items-center gap-2.5 px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="whitespace-nowrap font-medium">Within {maxDistance} km</span>
            <input
              type="range"
              min="20"
              max="600"
              step="20"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value, 10))}
              className="w-24 accent-emerald-600 cursor-pointer"
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
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
              className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
            >
              <div>
                {/* Clean Unboxed Metadata: Category · Subsidized · Distance */}
                <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-2 font-medium">
                  <span>{product.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{product.woreda}</span>
                  {product.distanceKm !== undefined && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-800 font-semibold">
                        {product.distanceKm} {t.distanceAway}
                      </span>
                    </>
                  )}
                </div>

                {/* Subsidized Coop Notice */}
                {product.isSubsidizedCoop && (
                  <div className="mb-2 flex items-center gap-1 text-[11px] font-medium text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t.subsidizedGovBadge}</span>
                  </div>
                )}

                {/* Product Title */}
                <h3 className="text-base font-bold text-stone-900 leading-snug">
                  {itemTitle}
                </h3>

                {/* Brand / Research Variety */}
                <p className="text-xs text-stone-600 mt-1">
                  Variety: <span className="font-medium text-stone-800">{product.brandOrVariety}</span>
                </p>

                {/* Description */}
                <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price & Stock & Action Row */}
              <div className="mt-5 pt-4 border-t border-stone-100">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-xl font-extrabold text-stone-900 tabular-nums">
                      {product.priceEtb.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-stone-700 ml-1">
                      {t.priceUnit} / {product.unit}
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-600 flex items-center gap-1">
                    <Box className="w-3.5 h-3.5 text-stone-500" />
                    <span className="tabular-nums font-semibold text-stone-700">{product.stockQuantity}</span> {t.stockAvailable}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOrderProduct(product)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{t.orderNow}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (product.category === 'SEED') onOpen3D('teff');
                      else if (product.category === 'TOOLS_PPE') onOpen3D('tractor');
                      else onOpen3D('teff');
                    }}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-stone-600" />
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <h2 className="text-lg font-bold text-stone-900 mb-1">Add Input Inventory Item</h2>
            <p className="text-xs text-stone-600 mb-4">Register fertilizer, seeds, or agro-tools for farmers in your woreda.</p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Product Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50"
                >
                  <option value="FERTILIZER">Fertilizer (Urea, NPS, DAP)</option>
                  <option value="SEED">Certified Seed</option>
                  <option value="PESTICIDE">Crop Protection / Pesticide</option>
                  <option value="TOOLS_PPE">Tools, Sprayers & PPE Clothing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Certified Teff Seed - DZ-Cr-37 (Magna)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Price (ETB)</label>
                  <input
                    type="number"
                    required
                    placeholder="4500"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="50kg Bag"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description & Storage Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Details regarding germination rate, soil type or safety..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-stone-50"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="subsidized"
                  checked={newSubsidized}
                  onChange={(e) => setNewSubsidized(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <label htmlFor="subsidized" className="text-xs text-stone-700">
                  Subsidized Cooperative Allocation (requires membership validation)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-sm"
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
