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
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
        <h1 className="text-xl font-bold text-stone-900 tracking-tight">{t.ordersTitle}</h1>
        <p className="text-xs text-stone-600 mt-1">
          Track escrow deposits, view buyer delivery verification codes, and trigger fund release.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 text-stone-500">
          <Clock className="w-8 h-8 mx-auto mb-2 text-stone-400" />
          <p className="text-sm font-semibold">No active orders yet.</p>
          <p className="text-xs text-stone-400 mt-1">
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
                className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4"
              >
                {/* Header Row: Unboxed Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                  <div className="flex items-center gap-2 font-mono font-bold text-stone-900">
                    <span>{order.orderNumber}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="font-sans font-medium text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Clean unboxed Status indicator */}
                  <div className="flex items-center gap-1.5 font-semibold">
                    {isCompleted ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> {t.statusCompleted}
                      </span>
                    ) : isEscrowHeld ? (
                      <span className="text-blue-700 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> {t.statusEscrowHeld} ({order.paymentMethod})
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {order.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Details Body */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-stone-900">
                      {order.productTitle || order.produceTitle}
                    </h3>
                    <div className="text-xs text-stone-600">
                      Quantity: <strong className="text-stone-900 font-semibold">{order.quantity} {order.unit}</strong> @ {order.unitPriceEtb.toLocaleString()} ETB
                    </div>
                    <div className="text-xs text-stone-600 flex items-center gap-1 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{order.deliveryAddress}</span>
                    </div>
                  </div>

                  {/* Parties & Phone */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs text-stone-700 space-y-1 min-w-[220px]">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Buyer:</span>
                      <strong className="text-stone-900">{order.buyerName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Seller:</span>
                      <strong className="text-stone-900">{order.sellerName}</strong>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-stone-200/60">
                      <span className="text-stone-500">Phone:</span>
                      <span className="font-mono text-[11px] text-stone-700 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {isBuyer ? order.sellerPhone : order.buyerPhone}
                      </span>
                    </div>
                  </div>

                  {/* Total Amount in ETB */}
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-stone-400 font-medium block">Total Payable</span>
                    <span className="text-2xl font-black text-stone-900 tabular-nums">
                      {order.totalAmountEtb.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-stone-600 ml-1">ETB</span>
                  </div>
                </div>

                {/* Buyer / Seller Secret OTP & Escrow Controls */}
                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Buyer View of Handover OTP */}
                  {isBuyer && !isCompleted && (
                    <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex-1 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-amber-900 block">
                          {t.buyerOtpNotice}
                        </span>
                        <span className="text-[11px] text-amber-700">
                          Do not share this code until goods are physically delivered and inspected.
                        </span>
                      </div>
                      <div className="bg-white px-3.5 py-1.5 rounded-lg border border-amber-300 font-mono font-black text-lg text-amber-950 tracking-widest shadow-xs">
                        {order.confirmationOtp}
                      </div>
                    </div>
                  )}

                  {/* Seller View: Trigger Release Button */}
                  {isSeller && !isCompleted && isEscrowHeld && (
                    <div className="flex-1 flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                      <div className="text-xs text-emerald-950">
                        <strong className="block text-emerald-900">Buyer code required:</strong>
                        Ask buyer for their 4-digit handover code upon delivery to release funds to your {order.paymentMethod}.
                      </div>
                      <button
                        onClick={() => {
                          setSelectedOrderForRelease(order);
                          setInputOtp('');
                          setReleaseResult(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Enter Code</span>
                      </button>
                    </div>
                  )}

                  {/* Completed Confirmation Banner */}
                  {isCompleted && (
                    <div className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>Release Escrow Payment</span>
            </div>
            <h2 className="text-lg font-bold text-stone-900 mb-1">
              {selectedOrderForRelease.orderNumber}
            </h2>
            <p className="text-xs text-stone-600 mb-4">
              Enter the 4-digit code provided by buyer <strong>{selectedOrderForRelease.buyerName}</strong>.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  4-Digit Handover Code
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="e.g. 4829"
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-300 bg-stone-50 font-mono text-center text-xl font-black tracking-widest text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-[11px] text-stone-400 mt-1 block text-center">
                  (For testing, code is visible on the buyer's order view)
                </span>
              </div>

              {/* Result Notice */}
              {releaseResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    releaseResult.success
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  {releaseResult.message}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForRelease(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReleasing || inputOtp.length !== 4}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
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
