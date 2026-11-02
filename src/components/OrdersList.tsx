import React, { useState } from 'react';
import { Order, User, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { ShieldCheck, KeyRound, CheckCircle, Clock, AlertCircle, Phone, MapPin } from 'lucide-react';

interface OrdersListProps {
  orders: Order[];
  currentUser: User;
  language: Language;
  onReleaseEscrow: (orderId: string, otp: string) => Promise<{ success: boolean; message: string }>;
}

export const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  currentUser,
  language,
  onReleaseEscrow,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [selectedOrderForRelease, setSelectedOrderForRelease] = useState<Order | null>(null);
  const [inputOtp, setInputOtp] = useState<string>('');
  const [releaseResult, setReleaseResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForRelease || !inputOtp) return;

    setIsReleasing(true);
    setReleaseResult(null);

    try {
      const res = await onReleaseEscrow(selectedOrderForRelease.id, inputOtp);
      setReleaseResult(res);
      if (res.success) {
        setTimeout(() => {
          setSelectedOrderForRelease(null);
          setInputOtp('');
          setReleaseResult(null);
        }, 2200);
      }
    } catch (err: any) {
      setReleaseResult({ success: false, message: err.message || 'Verification failed' });
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[24px] p-6 border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
        <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">{t.ordersTitle}</h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-normal">
          Track escrow deposits, view buyer delivery verification codes, and trigger fund release.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-[24px] p-12 text-center border border-[#E2E8F0] shadow-[0_10px_40px_rgba(15,23,42,0.08)] text-[#64748B]">
          <Clock className="w-8 h-8 mx-auto mb-2 text-[#94A3B8]" />
          <p className="text-sm font-bold text-[#0F172A]">No active orders yet.</p>
          <p className="text-xs text-[#64748B] mt-1">
            Browse agro-inputs or produce marketplace to start an order with safe escrow.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isBuyer = order.buyerId === currentUser.id;
            const isSeller = order.sellerId === currentUser.id;
            const isCompleted = order.status === 'COMPLETED';
            const isEscrowHeld = order.status === 'ESCROW_HELD';

            return (
              <div
                key={order.id}
                className="bg-white rounded-[24px] border border-[#E2E8F0] hover:border-blue-400 shadow-[0_10px_40px_rgba(15,23,42,0.08)] p-6 space-y-4 transition-all duration-300"
              >
                {/* Header Row: Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0] text-xs">
                  <div className="flex items-center gap-2 font-mono font-bold text-[#0F172A]">
                    <span>{order.orderNumber}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="font-sans font-medium text-[#64748B]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center gap-1.5 font-bold">
                    {isCompleted ? (
                      <span className="bg-emerald-50 text-[#10B981] border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-[#10B981]" /> {t.statusCompleted}
                      </span>
                    ) : isEscrowHeld ? (
                      <span className="bg-blue-50 text-[#2563EB] border border-blue-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-[#2563EB]" /> {t.statusEscrowHeld} ({order.paymentMethod})
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-[#F59E0B] border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-4 h-4 text-[#F59E0B]" /> {order.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Details Body */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#0F172A]">
                      {order.productTitle || order.produceTitle}
                    </h3>
                    <div className="text-xs text-[#64748B]">
                      Quantity: <strong className="text-[#0F172A] font-semibold">{order.quantity} {order.unit}</strong> @ {order.unitPriceEtb.toLocaleString()} ETB
                    </div>
                    <div className="text-xs text-[#64748B] flex items-center gap-1 pt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>{order.deliveryAddress}</span>
                    </div>
                  </div>

                  {/* Parties & Phone */}
                  <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] text-xs text-[#334155] space-y-1 min-w-[220px]">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Buyer:</span>
                      <strong className="text-[#0F172A] font-semibold">{order.buyerName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Seller:</span>
                      <strong className="text-[#0F172A] font-semibold">{order.sellerName}</strong>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-[#E2E8F0]">
                      <span className="text-[#64748B]">Phone:</span>
                      <span className="font-mono text-[11px] text-[#0F172A] font-bold flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#2563EB]" />
                        {isBuyer ? order.sellerPhone : order.buyerPhone}
                      </span>
                    </div>
                  </div>

                  {/* Total Amount in ETB */}
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider block">Total Payable</span>
                    <span className="text-2xl font-black text-[#0F172A] tabular-nums">
                      {order.totalAmountEtb.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-[#64748B] ml-1">ETB</span>
                  </div>
                </div>

                {/* Buyer / Seller Secret OTP & Escrow Controls */}
                <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Buyer View of Handover OTP */}
                  {isBuyer && !isCompleted && (
                    <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex-1 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-[#0F172A] block">
                          {t.buyerOtpNotice}
                        </span>
                        <span className="text-[11px] text-[#334155]">
                          Do not share this code until goods are physically delivered and inspected.
                        </span>
                      </div>
                      <div className="bg-white px-4 py-2 rounded-xl border border-blue-300 font-mono font-black text-xl text-[#2563EB] tracking-widest shadow-xs">
                        {order.confirmationOtp}
                      </div>
                    </div>
                  )}

                  {/* Seller View: Trigger Release Button */}
                  {isSeller && !isCompleted && isEscrowHeld && (
                    <div className="flex-1 flex items-center justify-between gap-3 bg-blue-50/80 border border-blue-200 rounded-2xl p-4">
                      <div className="text-xs text-[#0F172A]">
                        <strong className="block text-[#0F172A] font-bold">Buyer code required:</strong>
                        Ask buyer for their 4-digit handover code upon delivery to release funds to your {order.paymentMethod}.
                      </div>
                      <button
                        onClick={() => {
                          setSelectedOrderForRelease(order);
                          setInputOtp('');
                          setReleaseResult(null);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm hover:shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
                      >
                        <KeyRound className="w-4 h-4 text-white" />
                        <span>Enter Code</span>
                      </button>
                    </div>
                  )}

                  {/* Completed Confirmation Banner */}
                  {isCompleted && (
                    <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs text-[#334155] flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
                      <span>
                        Order fulfilled and {order.totalAmountEtb.toLocaleString()} ETB payment released via {order.paymentMethod}.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Escrow Release Modal */}
      {selectedOrderForRelease && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.15)] border border-[#E2E8F0]">
            <div className="flex items-center gap-2 text-[#2563EB] font-bold text-sm mb-1">
              <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
              <span>Release Escrow Payment</span>
            </div>
            <h2 className="text-lg font-black text-[#0F172A] mb-1">
              {selectedOrderForRelease.orderNumber}
            </h2>
            <p className="text-xs text-[#64748B] mb-4">
              Enter the 4-digit code provided by buyer <strong>{selectedOrderForRelease.buyerName}</strong>.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  4-Digit Handover Code
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="e.g. 4829"
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] font-mono text-center text-2xl font-black tracking-widest text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB]"
                />
                <span className="text-[11px] text-[#94A3B8] mt-1.5 block text-center">
                  (For testing, code is visible on the buyer's order view)
                </span>
              </div>

              {/* Result Notice */}
              {releaseResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    releaseResult.success
                      ? 'bg-emerald-50 text-[#10B981] border border-emerald-200'
                      : 'bg-red-50 text-[#EF4444] border border-red-200'
                  }`}
                >
                  {releaseResult.message}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForRelease(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReleasing || inputOtp.length !== 4}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isReleasing ? 'Verifying...' : 'Verify & Disburse Funds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
