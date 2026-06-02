import React, { useState, useEffect } from "react";
import { Check, Clock, Truck, ShieldCheck, MapPin, Phone, MessageSquare, RefreshCw, ChevronLeft } from "lucide-react";
import { Order, OrderStatus } from "../types";

interface OrderTrackerProps {
  orderId: string;
  onBackToShop: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId, onBackToShop }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchOrderStatus = async () => {
    try {
      if (!orderId) return;
      setErrorMsg("");
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Specified coffee order code was not found.");
      }
      const data = await response.json();
      setOrder(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to sync tracker coordinates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderStatus();
    
    // Set up auto tracker refresh poll every 7 seconds
    const pollId = setInterval(() => {
      fetchOrderStatus();
    }, 7000);

    return () => clearInterval(pollId);
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 font-sans">
        <RefreshCw className="h-10 w-10 text-roast animate-spin" />
        <h4 className="font-display font-medium text-lg text-espresso">Locating order coordinates...</h4>
        <p className="text-xs text-steam font-mono uppercase tracking-widest">Querying Safaricom billing confirmation</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4 font-sans px-4">
        <Clock className="h-12 w-12 text-[#C9933A] mx-auto animate-pulse" />
        <h3 className="font-display font-bold text-xl text-espresso">No active order matched code</h3>
        <p className="text-xs text-steam">
          {errorMsg || "The selected Order ID is not tracked on the distributor server yet."}
        </p>
        <div className="pt-2 flex gap-4 justify-center">
          <button
            onClick={onBackToShop}
            className="px-6 py-2.5 bg-roast text-cream font-bold rounded-lg text-sm transition-colors cursor-pointer"
          >
            Go to Boutique
          </button>
          <button
            onClick={fetchOrderStatus}
            className="px-6 py-2.5 bg-[#FAF7EF] text-espresso border border-cream font-bold rounded-lg text-sm transition-colors cursor-pointer"
          >
            Retry Refresh
          </button>
        </div>
      </div>
    );
  }

  // Set up step indices for highly robust timeline representation
  const stepsList = [
    { key: OrderStatus.PENDING_PAYMENT, label: "Order Received", desc: "Waiting for Safaricom checkout PIN consent." },
    { key: OrderStatus.CONFIRMED, label: "Payment Confirmed", desc: "M-Pesa transaction verified automatically." },
    { key: OrderStatus.PROCESSING, label: "Boutique Processing", desc: "Brew packaging is custom weighed and sealed." },
    { key: OrderStatus.DISPATCHED, label: "Rider Dispatched", desc: "Express delivery courier traveling to your zone." },
    { key: OrderStatus.DELIVERED, label: "Order Delivered", desc: "Fresh highlands bag delivered! Enjoy your brew!" },
  ];

  // Determine current timeline active steps index
  const getStepStatus = (stepKey: OrderStatus) => {
    const currentStatus = order.status;
    const allStatuses = stepsList.map(s => s.key);
    const currentIndex = allStatuses.indexOf(currentStatus);
    const stepIdx = allStatuses.indexOf(stepKey);

    if (currentStatus === OrderStatus.CANCELLED) {
      if (stepKey === OrderStatus.PENDING_PAYMENT) return "completed";
      return "cancelled";
    }

    if (stepIdx < currentIndex) return "completed";
    if (stepIdx === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans space-y-8 animate-scale-up-center">
      
      {/* Back button */}
      <button
        onClick={onBackToShop}
        className="flex items-center gap-1 text-xs font-bold text-steam hover:text-espresso transition-colors cursor-pointer focus:outline-none"
      >
        <ChevronLeft className="h-4 w-4" /> Go back to shop
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-cream shadow-md overflow-hidden">
        
        {/* Core Status Summary Header */}
        <div className="bg-espresso text-cream px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream/10">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-latte font-bold">Dynamic Cargo Timeline</span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="font-display font-black text-xl sm:text-2xl text-cream tracking-tight">Code: {order.id}</h2>
              <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded ${
                order.status === OrderStatus.DELIVERED
                  ? "bg-leaf/20 text-leaf border border-leaf/30"
                  : order.status === OrderStatus.CANCELLED
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-latte/20 text-latte border border-latte/30"
              }`}>
                {order.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-[10px] text-steam font-mono mt-1.5 leading-none">Placed: {new Date(order.createdAt).toLocaleString()}</p>
          </div>

          <button
            onClick={fetchOrderStatus}
            className="px-4 py-2 bg-cream/10 hover:bg-cream/20 text-cream rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all focus:outline-none cursor-pointer border border-transparent hover:border-cream/10"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Force Refresh status
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Panel: Real-time timelines */}
          <div className="md:col-span-7 space-y-6">
            <h4 className="text-[10px] font-mono tracking-widest uppercase text-steam font-black">Status checkpoints</h4>
            
            <div className="relative border-l-2 border-cream pl-6 ml-3 space-y-6">
              {stepsList.map((stepItem) => {
                const stepStatus = getStepStatus(stepItem.key);
                
                return (
                  <div key={stepItem.key} className="relative">
                    {/* Circle icon marker */}
                    <span className={`absolute -left-[35px] top-0.5 w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center ${
                      stepStatus === "completed"
                        ? "bg-leaf border-leaf text-white"
                        : stepStatus === "active"
                        ? "bg-latte border-latte text-white animate-pulse"
                        : stepStatus === "cancelled"
                        ? "bg-red-500 border-red-500 text-white"
                        : "bg-milk border-cream text-steam"
                    }`}>
                      {stepStatus === "completed" && <Check className="h-2.5 w-2.5" />}
                    </span>

                    {/* Step label description */}
                    <div className="space-y-0.5">
                      <h5 className={`text-xs font-bold ${
                        stepStatus === "active" ? "text-roast" : stepStatus === "completed" ? "text-espresso" : "text-steam"
                      }`}>
                        {stepItem.label}
                      </h5>
                      <p className="text-[11px] text-espresso/70 leading-relaxed pr-2">{stepItem.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Delivery instructions, driver, billing */}
          <div className="md:col-span-5 space-y-5">
            
            {/* Delivery address card */}
            <div className="bg-[#FAF7EF] rounded-xl p-4 border border-cream/50 space-y-3">
              <h5 className="font-mono text-[10px] font-black uppercase text-[#9B8675] tracking-wider">Destination details</h5>
              <div className="space-y-2 text-xs">
                <div className="flex gap-2">
                  <MapPin className="h-4.5 w-4.5 text-latte shrink-0" />
                  <div>
                    <strong className="text-espresso block font-sans">{order.guestName}</strong>
                    <p className="text-espresso/80 leading-relaxed mt-0.5">{order.deliveryAddress || "N/A"}</p>
                    {order.notes && <p className="text-[10px] text-steam italic mt-1.5 flex gap-1"><span>Notes:</span> "{order.notes}"</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* M-PESA payment details card */}
            <div className="bg-[#FAF7EF] rounded-xl p-4 border border-cream/50 space-y-3 text-xs">
              <h5 className="font-mono text-[10px] font-black uppercase text-[#9B8675] tracking-wider">M-Pesa payment info</h5>
              <div className="flex items-center gap-2 bg-white/60 p-2 rounded border border-cream/30">
                <ShieldCheck className="h-5 w-5 text-leaf shrink-0" />
                <div>
                  <p className="font-bold text-[11px] uppercase tracking-wide">M-PESA APPROVED</p>
                  <p className="text-[9px] text-[#9B8675] font-mono mt-0.5">
                    Receipt: <span className="font-bold text-espresso">{order.payment?.mpesaReceipt || "PENDING"}</span>
                  </p>
                </div>
              </div>
              <div className="space-y-1.5 text-[11px] font-mono border-t border-cream/50 pt-2 text-[#9B8675]">
                <div className="flex justify-between">
                  <span>Items value</span>
                  <span>KES {order.subtotalKes}</span>
                </div>
                {order.discountKes ? (
                  <div className="flex justify-between text-leaf text-[10px]">
                    <span>Discount Code</span>
                    <span>- KES {order.discountKes}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span>Shipping fee</span>
                  <span>KES {order.deliveryFeeKes}</span>
                </div>
                <div className="flex justify-between text-espresso font-display font-extrabold text-xs border-t border-cream/30 pt-1.5">
                  <span>Charged amount</span>
                  <span>KES {order.totalKes}</span>
                </div>
              </div>
            </div>

            {/* Simulated Driver John Kamau card (only shown if dispatched) */}
            {order.status === OrderStatus.DISPATCHED && (
              <div className="bg-[#FAF7EF] rounded-xl p-4.5 border-t-4 border-leaf border-l border-r border-b border-cream/50 space-y-4 animate-bounce">
                
                <div className="flex justify-between items-start">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-leaf text-[10px] font-mono font-bold tracking-wider uppercase border border-emerald-100">
                    <Truck className="h-3 w-3 shrink-0" /> Express Rider Assigned
                  </span>
                  <span className="text-[9px] font-mono text-[#9B8675]">23 Mins Away</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Fake beautiful driver avatar */}
                  <div className="h-10 w-10 bg-latte text-espresso rounded-full font-black border border-roast/35 flex items-center justify-center shadow-sm text-sm uppercase shrink-0">
                    JK
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-espresso font-sans">John Kamau</h5>
                    <p className="text-[9px] text-steam font-mono">Boxer 150 Boda Boda (KMF 432B)</p>
                  </div>
                </div>

                {/* Call buttons */}
                <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                  <a
                    href="tel:+254711998877"
                    className="py-1.5 bg-espresso hover:bg-roast rounded-lg text-cream flex items-center justify-center gap-1.5 cursor-pointer hover:text-cream transition-colors"
                  >
                    <Phone className="h-3 w-3" /> Call Rider
                  </a>
                  <button
                    onClick={() => alert("Simulated: SMS sent to driver to speed up!")}
                    className="py-1.5 bg-white border border-cream hover:bg-cream/20 text-espresso rounded-lg flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none"
                  >
                    <MessageSquare className="h-3 w-3" /> Quick SMS
                  </button>
                </div>
              </div>
            )}

          </div>
          
        </div>
      </div>
    </div>
  );
};
