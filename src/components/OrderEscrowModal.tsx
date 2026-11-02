import React, { useState } from 'react';
import { Product, ProduceListing, User, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { ShieldCheck, Lock, Smartphone, Building2, Truck, CheckCircle2, X } from 'lucide-react';

interface OrderEscrowModalProps {
  item: { type: 'PRODUCT'; data: Product } | { type: 'PRODUCE'; data: ProduceListing };
  currentUser: User;
  language: Language;
  onClose: () => void;
  onSubmitOrder: (orderPayload: any) => Promise<void>;
}

export const OrderEscrowModal: React.FC<OrderEscrowModalProps> = ({
  item,
  currentUser,
  language,
  onClose,
  onSubmitOrder,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const isProduct = item.type === 'PRODUCT';
  const product = isProduct ? (item.data as Product) : null;
  const produce = !isProduct ? (item.data as ProduceListing) : null;

  const title = isProduct ? product!.title : `${produce!.cropOrLivestock} (${produce!.variety}) ${produce!.grade}`;
  const unit = isProduct ? product!.unit : produce!.unit;
  const unitPrice = isProduct ? product!.priceEtb : produce!.pricePerUnitEtb;
  const sellerId = isProduct ? product!.supplierId : produce!.farmerId;

  const [quantity, setQuantity] = useState<number>(isProduct ? 2 : 10);
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'SUPPLIER_DELIVERY' | 'COOP_POINT'>('COOP_POINT');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(`${currentUser.woreda}, Main Cooperative Point`);
  const [paymentMethod, setPaymentMethod] = useState<'TELEBIRR' | 'CBE_BIRR' | 'CHAPA' | 'CASH_ON_DELIVERY'>('TELEBIRR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = quantity * unitPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitOrder({
        orderType: isProduct ? 'INPUT_PURCHASE' : 'PRODUCE_PURCHASE',
        sellerId,
        productId: product?.id,
        produceListingId: produce?.id,
        quantity,
        unitPriceEtb: unitPrice,
        deliveryMethod,
        deliveryAddress,
        paymentMethod,
      });
      onClose();
    } catch (err) {
      console.error('Order creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-7 shadow-[0_10px_40px_rgba(15,23,42,0.16)] border border-[#E2E8F0] relative my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-[#0F172A] rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span>FarmLink Safe Escrow Order</span>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] leading-tight">{title}</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Seller: <strong className="text-[#0F172A]">{isProduct ? 'EthioAgro Inputs' : 'Ato Bekele Tadesse'}</strong> · {isProduct ? product?.woreda : produce?.woreda}
          </p>
        </div>

        {/* Safe Escrow Explanation Callout */}
        <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-200/80 mb-5 text-xs text-[#0F172A] flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold block text-[#2563EB] mb-0.5">How your payment is protected:</span>
            Your payment is held in neutral escrow. You receive a secret 4-digit code to hand over to the seller only when the goods are physically inspected and accepted.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quantity Selector & Price Preview */}
          <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Order Quantity ({unit})</label>
              <input
                type="number"
                min="1"
                max="500"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-white font-bold text-sm text-[#0F172A] text-center focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#64748B] font-medium block mb-1">Total Escrow Payable</span>
              <span className="text-2xl font-black text-[#0F172A] tabular-nums">
                {totalAmount.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-[#64748B] ml-1">ETB</span>
            </div>
          </div>

          {/* Delivery Method Choice */}
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-2">Delivery & Handover Point</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeliveryMethod('COOP_POINT')}
                className={`p-2.5 rounded-xl border font-medium text-center transition-all cursor-pointer ${
                  deliveryMethod === 'COOP_POINT'
                    ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] font-bold'
                    : 'border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                <Building2 className={`w-4 h-4 mx-auto mb-1 ${deliveryMethod === 'COOP_POINT' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                <span>Coop Depot</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('PICKUP')}
                className={`p-2.5 rounded-xl border font-medium text-center transition-all cursor-pointer ${
                  deliveryMethod === 'PICKUP'
                    ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] font-bold'
                    : 'border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 mx-auto mb-1 ${deliveryMethod === 'PICKUP' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                <span>Store Pickup</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('SUPPLIER_DELIVERY')}
                className={`p-2.5 rounded-xl border font-medium text-center transition-all cursor-pointer ${
                  deliveryMethod === 'SUPPLIER_DELIVERY'
                    ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] font-bold'
                    : 'border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                <Truck className={`w-4 h-4 mx-auto mb-1 ${deliveryMethod === 'SUPPLIER_DELIVERY' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                <span>Local Transport</span>
              </button>
            </div>
          </div>

          {/* Delivery Address Field */}
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Designated Woreda / Kebele Address</label>
            <input
              type="text"
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* Payment Method Choice (Telebirr / CBE Birr / Chapa / Cash) */}
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-2">Payment Channel</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('TELEBIRR')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                  paymentMethod === 'TELEBIRR'
                    ? 'border-[#2563EB] bg-blue-50/80 text-[#0F172A] font-bold'
                    : 'border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-black text-xs shrink-0">
                  tb
                </div>
                <div>
                  <div className="font-bold">Telebirr</div>
                  <div className="text-[10px] text-[#64748B] font-normal">Ethio Telecom Wallet</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CBE_BIRR')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                  paymentMethod === 'CBE_BIRR'
                    ? 'border-purple-800 bg-purple-50 text-[#0F172A] font-bold'
                    : 'border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-900 text-amber-300 flex items-center justify-center font-black text-xs shrink-0">
                  CBE
                </div>
                <div>
                  <div className="font-bold">CBE Birr</div>
                  <div className="text-[10px] text-[#64748B] font-normal">Commercial Bank of Ethiopia</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CHAPA')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                  paymentMethod === 'CHAPA'
                    ? 'border-emerald-700 bg-emerald-50 text-[#0F172A] font-bold'
                    : 'border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  CH
                </div>
                <div>
                  <div className="font-bold">Chapa</div>
                  <div className="text-[10px] text-[#64748B] font-normal">Cards & Mobile Banking</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-[#0F172A] bg-slate-100 text-[#0F172A] font-bold'
                    : 'border-[#E2E8F0] bg-white text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  COD
                </div>
                <div>
                  <div className="font-bold">Cash On Delivery</div>
                  <div className="text-[10px] text-[#64748B] font-normal">Verified Depot Cashier</div>
                </div>
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Authorizing Escrow...'
                  : `Authorize ${totalAmount.toLocaleString()} ETB Escrow`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
