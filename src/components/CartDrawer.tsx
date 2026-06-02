import React, { useState } from "react";
import { X, Trash2, Plus, Minus, Ticket, Check, ShieldCheck, ShoppingBag, Gift } from "lucide-react";
import { useCart } from "../context/CartContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const {
    cart,
    updateQty,
    removeFromCart,
    subtotal,
    promoCode,
    promoDiscountPercent,
    promoError,
    promoSuccess,
    applyPromo,
    removePromo,
    total,
    freeShippingProgress,
    isNairobiEligible,
    deliveryZone,
    deliveryFee,
  } = useCart();

  const [promoInput, setPromoInput] = useState("");
  const [submittingPromo, setSubmittingPromo] = useState(false);

  if (!isOpen) return null;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setSubmittingPromo(true);
    await applyPromo(promoInput);
    setSubmittingPromo(false);
  };

  const activeVouchers = [
    { code: "MUGISTART", desc: "10% Introductory Discount" },
    { code: "FRESHROAST", desc: "15% Fresh Roast Fans Coupon" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-espresso/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-milk border-l border-cream flex flex-col shadow-2xl relative">
          
          {/* Header */}
          <div className="h-20 px-6 border-b border-cream flex items-center justify-between bg-milk">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="h-5 w-5 text-roast" />
              <h2 className="font-display font-black text-xl text-espresso uppercase tracking-tight">Your Coffee Basket</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-espresso/70 hover:text-roast hover:bg-cream/40 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Free Delivery Promo Bar */}
            {cart.length > 0 && (
              <div className="bg-[#FAF6EC] border border-cream rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#9B8675] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <Gift className="h-3.5 w-3.5 text-leaf" /> Nairobi Free Delivery Limit
                  </span>
                  <span className="text-leaf font-bold">KES 2,500</span>
                </div>
                
                {/* Progress bar */}
                <div className="h-2 bg-[#EFE9DB] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-leaf rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>

                <p className="text-[11px] text-espresso/70">
                  {subtotal >= 2500 ? (
                    <span className="text-leaf font-semibold">🎉 Order KES 2,500+ achieved! Free delivery applied (Nairobi zones).</span>
                  ) : (
                    <span>Add <strong className="text-roast font-mono">KES {2500 - subtotal}</strong> more to claim Free Shipping!</span>
                  )}
                </p>
              </div>
            )}

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="bg-cream/40 p-6 rounded-full">
                  <ShoppingBag className="h-12 w-12 text-latte" />
                </div>
                <h3 className="font-display font-bold text-lg text-espresso">Basket is Empty</h3>
                <p className="text-xs text-steam max-w-xs">
                  Browse our gourmet boutique catalogue and add rich Mount Kenya Arabica bags to start!
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-roast hover:bg-espresso text-cream font-bold rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Start Scenting
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex gap-4 p-3 bg-white/70 hover:bg-white rounded-xl border border-cream/50 transition-colors shadow-sm"
                  >
                    {/* Item Thumbnail */}
                    <div className="h-16 w-16 rounded-lg bg-[#ECE3CC] overflow-hidden shrink-0">
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    </div>

                    {/* Meta and quantities */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1.5">
                      <div>
                        <h4 className="font-semibold text-xs text-espresso truncate">{item.productName}</h4>
                        <p className="text-[10px] text-steam font-mono">{item.variantLabel}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 bg-[#F3ECE0] rounded-lg px-2 py-0.5 border border-cream">
                          <button
                            onClick={() => updateQty(item.variantId, item.qty - 1)}
                            className="p-1 hover:text-roast cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-mono text-xs font-black text-espresso w-4 text-center">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.variantId, item.qty + 1)}
                            className="p-1 hover:text-roast cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-mono text-xs font-bold text-espresso">
                          KES {item.unitPrice * item.qty}
                        </span>
                      </div>
                    </div>

                    {/* Delete item button */}
                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="text-steam hover:text-[#C93B3B] p-1.5 self-start cursor-pointer transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Loyalty Prompt coupons */}
            {cart.length > 0 && (
              <div className="border-t border-cream/80 pt-5 space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#9B8675] font-bold">Apply Vouchers</h4>
                
                {/* Coupon entry */}
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3 top-2.5 h-4 w-4 text-steam" />
                    <input
                      type="text"
                      placeholder="e.g. MUGISTART"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="w-full bg-[#FAF7EF] border border-cream rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-latte focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingPromo}
                    className="px-4 py-2 bg-espresso hover:bg-roast disabled:bg-steam text-cream font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {/* Info Feedbacks */}
                {promoError && <p className="text-[10px] text-red-600 font-semibold">{promoError}</p>}
                {promoSuccess && (
                  <div className="bg-emerald-50 text-leaf text-xs p-2 rounded-lg border border-emerald-100 flex items-center justify-between">
                    <span>{promoSuccess}</span>
                    <button onClick={removePromo} className="text-[10px] text-steam hover:text-roast underline cursor-pointer">
                      Remove
                    </button>
                  </div>
                )}

                {/* Clickable Active Deals */}
                {!promoCode && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {activeVouchers.map((v) => (
                      <button
                        key={v.code}
                        onClick={() => {
                          setPromoInput(v.code);
                          applyPromo(v.code);
                        }}
                        className="text-left p-2.5 bg-cream/10 hover:bg-cream/40 border border-cream rounded-lg transition-colors cursor-pointer group"
                      >
                        <div className="flex font-mono text-[10px] font-bold text-roast justify-between items-center">
                          <span>{v.code}</span>
                          <span className="text-[8px] bg-roast text-cream px-1.5 py-0.5 rounded uppercase">Save</span>
                        </div>
                        <p className="text-[9px] text-[#9B8675] mt-0.5 group-hover:text-espresso">{v.desc}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom summaries / checkout */}
          {cart.length > 0 && (
            <div className="border-t border-cream p-6 bg-milk space-y-4 shadow-inner">
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-espresso/80">
                  <span>Bag Subtotal</span>
                  <span className="font-bold">KES {subtotal}</span>
                </div>
                
                {promoDiscountPercent > 0 && (
                  <div className="flex justify-between text-leaf">
                    <span>Coupon ({promoDiscountPercent}%)</span>
                    <span className="font-bold">- KES {Math.round((subtotal * promoDiscountPercent) / 100)}</span>
                  </div>
                )}

                <div className="flex justify-between text-espresso/80 pb-2 border-b border-cream/50">
                  <span className="flex flex-col">
                    <span>Est. Delivery</span>
                    <span className="text-[9px] text-steam font-sans">
                      {deliveryZone ? `Zone: ${deliveryZone.name}` : "Calculated at checkout"}
                    </span>
                  </span>
                  <span className="font-bold text-right pt-1.5">
                    {deliveryZone ? (deliveryFee === 0 ? "FREE" : `KES ${deliveryFee}`) : "TBD"}
                  </span>
                </div>

                <div className="flex justify-between text-base font-display font-black text-espresso pt-1">
                  <span>Total Due</span>
                  <span>KES {total}</span>
                </div>
              </div>

              {/* Secure STK Push Tagline */}
              <div className="bg-[#FAF7EF] p-2.5 border border-cream rounded-lg flex items-center gap-2 text-[10px] text-espresso/70">
                <ShieldCheck className="h-4 w-4 text-leaf shrink-0" />
                <span>Supports direct secure Safaricom M-Pesa STK Pin Popups</span>
              </div>

              {/* Bottom Actions */}
              <button
                onClick={onCheckout}
                className="w-full py-4 bg-roast hover:bg-espresso text-cream hover:text-cream text-center rounded-xl font-bold transition-all shadow-md transform active:scale-[0.98] cursor-pointer"
              >
                Proceed to Checkout
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-2 border border-cream hover:bg-cream/20 text-steam hover:text-espresso text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};
