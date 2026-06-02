import React, { useState, useEffect } from "react";
import { Ticket, CreditCard, ShieldCheck, PhoneCall, Loader2, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { DeliveryZone, OrderStatus } from "../types";
import { SEED_DELIVERY_ZONES } from "../data/coffeeData";

interface CheckoutFormProps {
  onOrderCompleted: (orderId: string) => void;
  onBackToShop: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onOrderCompleted, onBackToShop }) => {
  const {
    cart,
    subtotal,
    deliveryZone,
    setDeliveryZone,
    deliveryFee,
    promoCode,
    promoDiscountPercent,
    total,
    clearCart,
  } = useCart();

  // Step state: 1 = Contact & Delivery, 2 = Payment Processing
  const [step, setStep] = useState(1);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<"MPESA" | "CARD">("MPESA");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState("");
  const [stkState, setStkState] = useState<"IDLE" | "PUSHING" | "AWAITING_PIN" | "SUCCESS" | "FAILED">("IDLE");
  const [pollingSeconds, setPollingSeconds] = useState(0);
  const [generatedOrderId, setGeneratedOrderId] = useState("");

  // Populate M-Pesa phone number when step 1 phone changes
  useEffect(() => {
    if (phone && !mpesaPhone) {
      setMpesaPhone(phone);
    }
  }, [phone]);

  if (cart.length === 0 && GeneratedOrderIdIsEmpty(generatedOrderId)) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4 font-sans">
        <div className="bg-cream/40 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
          <ShoppingBag className="h-10 w-10 text-latte" />
        </div>
        <h3 className="font-display font-bold text-xl text-espresso">Your Checkout Basket is Empty</h3>
        <p className="text-xs text-steam pr-2">Fill your bag with premium Mt. Kenya whole beans in the shop boutique first!</p>
        <button onClick={onBackToShop} className="px-6 py-2.5 bg-roast text-cream font-bold rounded-lg text-sm transition-colors cursor-pointer">
          Go to Boutique
        </button>
      </div>
    );
  }

  function GeneratedOrderIdIsEmpty(id: string) {
    return !id;
  }

  // Pre-fill fields for simple demonstration when requested
  const handleAutofillDemo = () => {
    setName("Diana Mugoh");
    setEmail("dianamugoh.va@gmail.com");
    setPhone("0711223344");
    setAddress("Westlands, Nairobi - off Peponi Rd, Block C, Apt 4");
    setNotes("Leave with guard at the gate if not picked up immediately.");
    setDeliveryZone(SEED_DELIVERY_ZONES[1]); // Westlands
  };

  const handleNextStep = () => {
    setFormError("");
    if (!name.trim()) return setFormError("Customer Full Name is required.");
    if (!email.trim() || !email.includes("@")) return setFormError("Valid Guest Email is required for confirmations.");
    if (!phone.trim() || phone.length < 9) return setFormError("A valid Kenya Phone Number (e.g. 07XXXXXXXX) is required.");
    if (!deliveryZone) return setFormError("Please select a delivery zone mapping for Nairobi/Naivasha.");
    
    // Check if address is filled for non-pickup zones
    const isPickup = deliveryZone.feeKes === 0;
    if (!isPickup && !address.trim()) {
      return setFormError("Delivery physical location address is required.");
    }

    setStep(2);
  };

  const handleInitiateSTKPush = async () => {
    setIsProcessing(true);
    setStkState("PUSHING");
    setFormError("");
    
    try {
      // 1. Create order on the Express server
      const itemsPayload = cart.map((i) => ({ variantId: i.variantId, qty: i.qty }));
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: name,
          guestEmail: email,
          guestPhone: phone,
          deliveryZoneId: deliveryZone?.id,
          deliveryAddress: address,
          notes,
          promoCode,
          items: itemsPayload,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create order on server.");
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.orderId;
      setGeneratedOrderId(orderId);

      // 2. Trigger STK push
      const pushResponse = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId,
          phone: mpesaPhone,
        }),
      });

      if (!pushResponse.ok) {
        const errorData = await pushResponse.json();
        throw new Error(errorData.error || "STK push initiation failed.");
      }

      const pushData = await pushResponse.json();
      setCheckoutRequestId(pushData.CheckoutRequestID);
      
      // Upgrade step to awaiting pin prompt
      setStkState("AWAITING_PIN");
      setPollingSeconds(1);

    } catch (err: any) {
      console.error("Payment initiation error:", err);
      setFormError(err.message || "Checkout processing error. Please try again.");
      setStkState("IDLE");
      setIsProcessing(false);
    }
  };

  // Poll server for status updates when awaiting PIN callback
  useEffect(() => {
    let intervalId: any;
    if (stkState === "AWAITING_PIN" && generatedOrderId) {
      let ticks = 0;
      intervalId = setInterval(async () => {
        try {
          ticks += 3;
          setPollingSeconds((p) => p + 3);

          const response = await fetch(`/api/orders/${generatedOrderId}`);
          if (response.ok) {
            const orderObj = await response.json();
            if (orderObj.status === OrderStatus.CONFIRMED) {
              setStkState("SUCCESS");
              setIsProcessing(false);
              clearInterval(intervalId);
              // Fire order success redirect callback
              setTimeout(() => {
                clearCart();
                onOrderCompleted(generatedOrderId);
              }, 1200);
            } else if (orderObj.status === OrderStatus.CANCELLED) {
              setStkState("FAILED");
              setIsProcessing(false);
              setFormError("M-Pesa STK push was canceled or declined by user on phone.");
              clearInterval(intervalId);
            }
          }

          if (ticks >= 45) { // 45 seconds timeout
            setStkState("IDLE");
            setIsProcessing(false);
            setFormError("Daraja callback timeout. Please retry push payment.");
            clearInterval(intervalId);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [stkState, generatedOrderId]);

  // Direct skip button to bypass waiting 5 seconds
  const handleSimulateDirectApprove = async () => {
    if (!generatedOrderId || !checkoutRequestId) return;
    try {
      const mockWebhookPayload = {
        Body: {
          stkCallback: {
            MerchantRequestID: "MUGI-MOCK-MERCH",
            CheckoutRequestID: checkoutRequestId,
            ResultCode: 0,
            ResultDesc: "Direct Simulation Approved",
            CallbackMetadata: {
              Item: [
                { Name: "Amount", Value: total },
                { Name: "MpesaReceiptNumber", Value: "MUGMOCK" + Math.random().toString(36).substring(2, 7).toUpperCase() },
                { Name: "PhoneNumber", Value: 254711223344 }
              ]
            }
          }
        }
      };

      await fetch("/api/mpesa/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockWebhookPayload),
      });
    } catch (e) {
      console.error("Direct simulation error:", e);
    }
  };

  const isPickupZoneSelected = deliveryZone ? deliveryZone.feeKes === 0 : false;
  const discountKes = Math.round((subtotal * promoDiscountPercent) / 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Steps Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-cream shadow-md overflow-hidden flex flex-col">
          
          {/* Header step guide */}
          <div className="bg-espresso text-cream px-6 py-5 flex justify-between items-center select-none">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-latte">Express M-Pesa Checkout</span>
              <h3 className="font-display font-bold text-lg">
                {step === 1 ? "1. Customer & Delivery" : "2. M-Pesa Safe Payment"}
              </h3>
            </div>
            
            {step === 1 && (
              <button
                onClick={handleAutofillDemo}
                className="text-[10px] font-mono bg-cream/10 hover:bg-cream/20 text-cream px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                ⚡ Auto-fill Form
              </button>
            )}
          </div>

          {/* Form wrapper */}
          <div className="p-6 flex-1 space-y-6">
            {formError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {step === 1 ? (
              // STEP 1 CONTENT
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider uppercase text-steam font-bold block">Contact Full Name*</label>
                    <input
                      type="text"
                      placeholder="e.g. Diana Mugoh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FAF7EF] border border-cream focus:border-latte rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-latte focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider uppercase text-steam font-bold block">Email Address*</label>
                    <input
                      type="email"
                      placeholder="Diana.mugoh.va@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FAF7EF] border border-cream focus:border-latte rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-latte focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Mobile Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider uppercase text-steam font-bold block">
                    Mobile Phone Number (STK target)*
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 0711223344"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FAF7EF] border border-cream focus:border-latte rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-latte focus:outline-none focus:bg-white transition-colors text-xs"
                  />
                  <p className="text-[9px] text-[#9B8675] font-mono">Used for delivery alerts and M-Pesa push prompts directly.</p>
                </div>

                {/* Delivery Zone Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-wider uppercase text-steam font-bold block">Select Delivery Zone Mapping*</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {SEED_DELIVERY_ZONES.map((zone) => (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => setDeliveryZone(zone)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all flex justify-between items-center cursor-pointer ${
                          deliveryZone?.id === zone.id
                            ? "bg-roast/5 border-roast ring-1 ring-roast"
                            : "bg-milk border-cream hover:border-latte"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-espresso">{zone.name}</p>
                          <p className="text-[10px] text-steam leading-relaxed font-normal">{zone.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-roast text-sm block">
                            {zone.feeKes === 0 ? "FREE" : `KES ${zone.feeKes}`}
                          </span>
                          {zone.estimatedHours > 0 && (
                            <span className="text-[9px] text-[#9B8675] font-mono">
                              Est: {zone.estimatedHours}h
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Physical Delivery location address (only shown if not pickup) */}
                {!isPickupZoneSelected && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider uppercase text-steam font-bold block">Address & Area Details*</label>
                    <textarea
                      rows={3}
                      placeholder="Include neighborhood, road/street name, estate name, apartment number/gate color etc."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#FAF7EF] border border-cream focus:border-latte rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-latte focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>
                )}

                {/* Delivery Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider uppercase text-steam font-bold block">Rider Special Instructions (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Leave with security guard, call when outside etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#FAF7EF] border border-cream focus:border-latte rounded-xl py-3 px-4 text-xs focus:ring-1 focus:ring-latte focus:outline-none focus:bg-white transition-colors"
                  />
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-cream flex justify-between">
                  <button
                    onClick={onBackToShop}
                    className="px-5 py-3 border border-cream text-steam hover:text-espresso rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" /> Return to shop
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-roast text-cream rounded-xl text-xs font-bold shadow hover:bg-espresso transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Continue to Payment <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              // STEP 2 CONTENT - INTEGRATED POPUP SIMULATION
              <div className="space-y-6">
                
                {/* Method selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-[#9B8675] font-bold block">Choice Payment Route</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("MPESA")}
                      className={`p-3.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        paymentMethod === "MPESA"
                          ? "bg-roast/5 border-roast text-roast"
                          : "bg-white border-cream text-espresso/70"
                      }`}
                    >
                      <CheckCircle2 className={`h-4.5 w-4.5 ${paymentMethod === "MPESA" ? "text-leaf" : "text-cream"}`} />
                      <span>Safaricom M-Pesa</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("CARD")}
                      className={`p-3.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        paymentMethod === "CARD"
                          ? "bg-roast/5 border-roast text-roast"
                          : "bg-white border-cream text-espresso/70"
                      }`}
                    >
                      <CreditCard className="h-5 w-5" />
                      <span>Card Fallback (Flutterwave)</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === "MPESA" ? (
                  <div className="space-y-4">
                    <div className="bg-[#FAF7EF] border border-cream rounded-xl p-4.5 space-y-4 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-xs">Simulated Safaricom Daraja v2 Service</h4>
                          <p className="text-[10px] text-steam font-sans">We will push a genuine-style STK Pin Popup securely</p>
                        </div>
                        <span className="bg-leaf/10 text-leaf text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          Secure STK PUSH
                        </span>
                      </div>

                      {/* Phone target for push */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-[#9B8675] font-bold block">M-Pesa STK Target Phone Number</label>
                        <input
                          type="text"
                          placeholder="07XXXXXXXX"
                          value={mpesaPhone}
                          disabled={stkState !== "IDLE"}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          className="w-full bg-white border border-cream focus:border-latte rounded-xl py-3 px-4 text-xs font-mono tracking-widest focus:ring-1 focus:ring-latte focus:outline-none"
                        />
                        <p className="text-[9px] text-[#9B8675] font-mono mt-0.5">Will be normalized to format: 254XXXXXXXXX</p>
                      </div>

                      {/* Pushing Loader screen */}
                      {stkState === "PUSHING" && (
                        <div className="p-4 bg-espresso text-cream rounded-xl flex items-center justify-between border border-[#FAF7EF]">
                          <span className="text-xs font-semibold flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-latte" />
                            Establishing merchant Daraja portal query...
                          </span>
                        </div>
                      )}

                      {/* SMART PHONE TRANSACTION PROMPT SIMULATION POPUP */}
                      {stkState === "AWAITING_PIN" && (
                        <div className="relative border-t-2 border-dashed border-cream/70 pt-4 mt-2 space-y-3 animate-fade-in-down">
                          
                          {/* Floating iPhone simulation interface */}
                          <div className="bg-espresso text-[#FAF7EF] p-4.5 rounded-2xl max-w-sm mx-auto shadow-2xl relative border border-cream/20 space-y-4">
                            
                            {/* Simulator header status bar */}
                            <div className="flex justify-between items-center pb-2.5 border-b border-[#FAF7EF]/10 mb-2">
                              <span className="text-[10px] font-mono tracking-wider uppercase text-latte flex items-center gap-1.5 font-bold">
                                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
                                M-PESA POPUP STK SIMULATOR
                              </span>
                              <span className="text-[9px] font-mono text-steam">PIN REQUEST</span>
                            </div>

                            {/* Center simulation box */}
                            <div className="bg-white text-[#2C1503] font-sans p-4 rounded-xl text-center space-y-3.5 border-t-4 border-leaf shadow-inner">
                              <h5 className="font-extrabold text-sm text-espresso uppercase tracking-tight">Do You Want To Pay?</h5>
                              <p className="text-[11px] text-[#2C1503]/80 leading-relaxed pr-1 text-center">
                                Pay <strong className="text-roast text-xs font-mono">KES {total}</strong> to <strong className="text-[#3A6B47] uppercase text-xs">Mugi Coffee Distributor</strong> for Order <strong className="text-rose-700 uppercase tracking-wider text-xs font-mono">{generatedOrderId}</strong>?
                              </p>

                              {/* Input and instruction */}
                              <div className="space-y-2">
                                <p className="text-[9px] text-steam uppercase tracking-wider font-semibold font-mono">Please Enter M-Pesa 4-Digit Security PIN</p>
                                <div className="flex justify-center gap-2">
                                  <span className="bg-[#FAF7EF] border border-cream py-1.5 w-10 text-center font-bold text-lg font-mono rounded">●</span>
                                  <span className="bg-[#FAF7EF] border border-cream py-1.5 w-10 text-center font-bold text-lg font-mono rounded">●</span>
                                  <span className="bg-[#FAF7EF] border border-cream py-1.5 w-10 text-center font-bold text-lg font-mono rounded">●</span>
                                  <span className="bg-[#FAF7EF] border border-cream py-1.5 w-10 text-center font-bold text-lg font-mono rounded">●</span>
                                </div>
                              </div>
                            </div>

                            {/* Simulation Actions */}
                            <div className="space-y-2">
                              <p className="text-[9px] text-cream/70 text-center bg-[#FAF7EF]/5 p-2 rounded leading-relaxed border border-[#FAF7EF]/10">
                                This simulation behaves exactly like a real transaction. The backend will receive a secure Safaricom callback in <span className="font-mono font-bold text-latte">{Math.max(1, 6 - Math.round(pollingSeconds))} seconds</span> and automatically transition your order!
                              </p>

                              <button
                                type="button"
                                onClick={handleSimulateDirectApprove}
                                className="w-full py-2.5 bg-[#4AA659] hover:bg-emerald-600 focus:bg-emerald-600 text-[#FAF7EF] focus:text-[#FAF7EF] font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow transition-colors"
                              >
                                Simulate Approve Transaction
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Push trigger CTA */}
                      {stkState === "IDLE" && (
                        <button
                          type="button"
                          onClick={handleInitiateSTKPush}
                          className="w-full py-3.5 bg-roast hover:bg-espresso text-cream font-bold rounded-xl text-center shadow transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                        >
                          <CreditCard className="h-5 w-5 text-latte shrink-0" />
                          Pay KES {total} via Safaricom STK Push
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2 text-[10px] text-espresso/70 bg-cream/10 p-3 rounded-lg border border-cream/40">
                      <ShieldCheck className="h-4.5 w-4.5 text-leaf shrink-0" />
                      <span>This payment triggers directly through Safaricom security protocols. A secure Daraja API hook updates the status instantly upon entering your PIN.</span>
                    </div>
                  </div>
                ) : (
                  // CARD (FLUTTERWAVE FALLBACK)
                  <div className="bg-[#FAF7EF] border border-cream rounded-xl p-4.5 space-y-4 text-center">
                    <div className="p-4 bg-white/70 rounded-xl space-y-1.5 border border-cream/50 max-w-sm mx-auto">
                      <CreditCard className="h-8 w-8 text-roast mx-auto" />
                      <h4 className="font-bold text-xs text-espresso">Visa & Mastercard Fallback</h4>
                      <p className="text-[10px] text-steam leading-relaxed">Secure card payments hosted via Stripe / Flutterwave integrations.</p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        setIsProcessing(true);
                        // Save fake card order
                        const itemsPayload = cart.map((i) => ({ variantId: i.variantId, qty: i.qty }));
                        const response = await fetch("/api/orders", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            guestName: name,
                            guestEmail: email,
                            guestPhone: phone,
                            deliveryZoneId: deliveryZone?.id,
                            deliveryAddress: address,
                            notes,
                            promoCode,
                            items: itemsPayload,
                          }),
                        });
                        const data = await response.json();
                        setGeneratedOrderId(data.orderId);

                        // Fast confirm simulation
                        const webhookResponse = await fetch(`/api/orders/${data.orderId}/status`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: OrderStatus.CONFIRMED }),
                        });
                        
                        setTimeout(() => {
                          clearCart();
                          onOrderCompleted(data.orderId);
                        }, 1000);
                      }}
                      className="w-full py-3.5 bg-espresso hover:bg-roast text-cream font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Authenticate Secure Card Payment · KES {total}
                    </button>
                  </div>
                )}

                {/* Back to details */}
                <div className="pt-4 border-t border-cream">
                  <button
                    onClick={() => {
                      setStep(1);
                      setStkState("IDLE");
                      setIsProcessing(false);
                    }}
                    disabled={isProcessing}
                    className="px-5 py-2.5 border border-cream text-steam hover:text-espresso rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to delivery
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Order Summary Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF7EF] rounded-2xl border border-cream p-5 space-y-4">
            <h4 className="font-display font-black text-espresso text-base uppercase tracking-tight pb-3 border-b border-cream">
              Items summary
            </h4>

            {/* Line items list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.variantId} className="flex gap-3 justify-between items-center text-xs">
                  <div className="flex gap-2.5 items-center min-w-0">
                    <div className="h-10 w-10 bg-[#ECE3CC] rounded-lg overflow-hidden shrink-0">
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-espresso truncate">{item.productName}</p>
                      <p className="text-[10px] text-steam font-mono">{item.variantLabel} x {item.qty}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-espresso shrink-0">
                    KES {item.unitPrice * item.qty}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculation summary */}
            <div className="border-t border-cream/80 pt-4 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-espresso/70">
                <span>Basket Subtotal</span>
                <span className="font-bold">KES {subtotal}</span>
              </div>

              {promoDiscountPercent > 0 && (
                <div className="flex justify-between text-leaf">
                  <span>Promo Save ({promoDiscountPercent}%)</span>
                  <span className="font-bold">- KES {discountKes}</span>
                </div>
              )}

              <div className="flex justify-between text-espresso/70 pb-2 border-b border-cream/50">
                <span className="flex flex-col">
                  <span>Est. Delivery</span>
                  {deliveryZone && <span className="text-[8px] font-sans font-normal text-steam tracking-normal">Zone: {deliveryZone.name}</span>}
                </span>
                <span className="font-bold text-right pt-0.5">
                  {deliveryZone ? (deliveryFee === 0 ? "FREE" : `KES ${deliveryFee}`) : "Select Zone"}
                </span>
              </div>

              <div className="flex justify-between text-espresso text-sm font-display font-black pt-1">
                <span>Total Amount Due</span>
                <span>KES {total}</span>
              </div>
            </div>
          </div>

          {/* Quick Help Contacts Box */}
          <div className="bg-espresso rounded-2xl p-5 text-cream relative overflow-hidden border border-cream/10">
            {/* Ambient circle glow */}
            <div className="absolute top-0 right-0 h-20 w-20 bg-latte/10 rounded-full blur-xl" />
            
            <div className="space-y-3.5 relative z-10 text-xs text-cream/85">
              <span className="text-[9px] font-mono uppercase tracking-widest text-latte font-bold">Patron Support</span>
              <h4 className="font-display font-black text-cream text-md">Need assistance with your order?</h4>
              <p className="leading-relaxed font-sans pr-4">Our roastery team is active same-day. Reach out for any questions about origins, custom weights, or custom grinds!</p>
              
              <div className="pt-2 flex flex-col gap-2 font-mono text-[10px]">
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-latte shrink-0" />
                  <span>Call Nairobi: +254 791 291 281</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-latte shrink-0" />
                  <span>Call Naivasha: +254 728 372 031</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
