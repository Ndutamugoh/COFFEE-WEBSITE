import React, { useState, useEffect } from "react";
import { Coffee, ShieldCheck, Truck, TrendingUp, AlertTriangle, PackageOpen, ClipboardList, CheckSquare, Eye, Edit3, Loader2 } from "lucide-react";
import { Order, OrderStatus } from "../types";

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [adminError, setAdminError] = useState("");

  const fetchAdminOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) {
        throw new Error("Unable to read order coordinates.");
      }
      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      console.error(err);
      setAdminError("Unable to load orders from distributor directory database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminOrders();
    // Refresh admin tables automatically every 7 seconds
    const intervalId = setInterval(fetchAdminOrders, 7000);
    return () => clearInterval(intervalId);
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setStatusUpdating(true);
    setAdminError("");
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error("Server rejected status modification query.");
      }

      const updatedData = await response.json();
      if (updatedData.success) {
        // Update local order list
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
        );
        // Refresh selected order if it is the currently visible one
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
        }
      }
    } catch (err: any) {
      console.error(err);
      setAdminError("Could not save status change to persistent JSON database.");
    } finally {
      setStatusUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 font-sans">
        <Loader2 className="h-10 w-10 text-roast animate-spin" />
        <h4 className="font-display font-medium text-lg text-espresso">Opening administrative board...</h4>
        <p className="text-xs text-steam font-mono uppercase tracking-widest">Compiling distributor database accounts</p>
      </div>
    );
  }

  // Calculate dynamic business statistics metrics
  const totalOrdersCount = orders.length;
  const grossRevenue = orders
    .filter((o) => o.status !== OrderStatus.CANCELLED)
    .reduce((sum, o) => sum + o.totalKes, 0);

  const pendingPaymentsCount = orders.filter((o) => o.status === OrderStatus.PENDING_PAYMENT).length;
  const dispatchDeliveriesCount = orders.filter((o) => o.status === OrderStatus.DISPATCHED).length;
  const pendingProcessingCount = orders.filter((o) => o.status === OrderStatus.PROCESSING || o.status === OrderStatus.CONFIRMED).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8 animate-fade-in-down">
      
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#9B8675] font-black">Mugi Operations Terminal</span>
          <h1 className="font-display font-black text-3xl text-espresso tracking-tight">Client-Managed Administrative Console</h1>
          <p className="text-xs text-steam font-normal">Supervise incoming shipments, M-Pesa clearing transactions, and delivery timelines.</p>
        </div>

        <div className="bg-[#FAF7EF] rounded-xl px-4 py-2 border border-cream shadow-sm text-xs font-mono flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-leaf" />
          <span>Authenticated as: <strong className="text-roast">ROASTERY ADMIN</strong></span>
        </div>
      </div>

      {adminError && (
        <div className="p-3 bg-red-100 text-red-800 text-xs rounded-xl border border-red-200 flex items-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span>{adminError}</span>
        </div>
      )}

      {/* Dynamic Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenues */}
        <div className="bg-white rounded-xl border border-cream p-5 shadow-sm space-y-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-mono text-steam uppercase tracking-wider font-bold">
            <span>Aggregated Revenues</span>
            <TrendingUp className="h-5.5 w-5.5 text-leaf" />
          </div>
          <div>
            <h3 className="font-mono text-xl sm:text-2xl font-black text-[#202020] leading-none">KES {grossRevenue.toLocaleString()}</h3>
            <p className="text-[10px] text-steam leading-none mt-2 font-mono">EXCLUDES CANCELLED CHECKOUTS</p>
          </div>
        </div>

        {/* Total Orders Volume */}
        <div className="bg-white rounded-xl border border-cream p-5 shadow-sm space-y-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-mono text-steam uppercase tracking-wider font-bold">
            <span>Incoming Shipments</span>
            <ClipboardList className="h-5.5 w-5.5 text-latte" />
          </div>
          <div>
            <h3 className="font-mono text-xl sm:text-2xl font-black text-[#202020] leading-none">{totalOrdersCount} Bags</h3>
            <p className="text-[10px] text-steam leading-none mt-2 font-mono">B2C + B2B LIGHT PIPELINES</p>
          </div>
        </div>

        {/* Pending clear */}
        <div className="bg-white rounded-xl border border-cream p-5 shadow-sm space-y-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-mono text-steam uppercase tracking-wider font-bold">
            <span>Awaiting MPesa Clean</span>
            <AlertTriangle className="h-5.5 w-5.5 text-amber-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-mono text-xl sm:text-2xl font-black text-[#202020] leading-none">{pendingPaymentsCount} Orders</h3>
            <p className="text-[10px] text-[#C9933A] leading-none mt-2 font-semibold">STK REQUESTS IN PROGRESS</p>
          </div>
        </div>

        {/* Dispatched */}
        <div className="bg-white rounded-xl border border-cream p-5 shadow-sm space-y-2.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-mono text-steam uppercase tracking-wider font-bold">
            <span>Active Cargo Transit</span>
            <Truck className="h-5.5 w-5.5 text-leaf" />
          </div>
          <div>
            <h3 className="font-mono text-xl sm:text-2xl font-black text-[#202020] leading-none">{dispatchDeliveriesCount} Transits</h3>
            <p className="text-[10px] text-leaf leading-none mt-2 font-semibold font-mono">MOTOR COURIERS DISPATCHED</p>
          </div>
        </div>

      </div>

      {/* Main Operations Block layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Orders Table Column (8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-cream shadow-md overflow-hidden">
          <div className="bg-[#FAF7EF] px-6 py-4.5 border-b border-cream flex justify-between items-center">
            <h3 className="font-display font-black text-espresso text-base uppercase tracking-tight flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-roast" /> Direct Orders Register
            </h3>
            <span className="font-mono text-[10px] text-steam uppercase tracking-widest font-black">Active poll 7s</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FCFAF4] text-[#9B8675] font-mono border-b border-cream uppercase text-[10px] font-bold select-none">
                  <th className="py-3 px-5">Order Reference</th>
                  <th className="py-3 px-5">Patron</th>
                  <th className="py-3 px-5">Dynamic destination</th>
                  <th className="py-3 px-5">Amount due</th>
                  <th className="py-3 px-5">Cargo status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream/60">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#9B8675] text-xs font-sans">
                      No customer transactions logged in Safaricom Daraja callback webhook registers yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#FCFAF4] transition-colors">
                      {/* ID */}
                      <td className="py-4.5 px-5 font-mono font-black text-espresso leading-none">
                        {o.id}
                      </td>

                      {/* Patron */}
                      <td className="py-4.5 px-5">
                        <p className="font-bold text-espresso">{o.guestName}</p>
                        <p className="text-[10px] text-steam font-mono mt-0.5">{o.guestPhone}</p>
                      </td>

                      {/* Dynamic destination */}
                      <td className="py-4.5 px-5 max-w-[160px] truncate">
                        <p className="font-semibold text-espresso">{o.deliveryAddress ? o.deliveryAddress : "Self Collection"}</p>
                      </td>

                      {/* Amount Due */}
                      <td className="py-4.5 px-5 font-mono text-espresso font-bold">
                        KES {o.totalKes}
                      </td>

                      {/* cargo status */}
                      <td className="py-4.5 px-5">
                        <span className={`inline-block text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          o.status === OrderStatus.DELIVERED
                            ? "bg-leaf/10 text-leaf border border-leaf/20"
                            : o.status === OrderStatus.CANCELLED
                            ? "bg-red-100 text-red-600 border border-red-200"
                            : "bg-amber-100 text-[#C9933A] border border-amber-200"
                        }`}>
                          {o.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4.5 px-5 text-right shrink-0">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3 py-1.5 bg-[#FAF7EF] border border-cream text-espresso hover:bg-cream/40 rounded-lg text-[10px] font-bold font-sans transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="h-3.5 w-3.5" /> Supervise
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Order Detail Panel Column (4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-cream shadow-md overflow-hidden flex flex-col">
            <div className="bg-[#FAF7EF] px-6 py-4.5 border-b border-cream">
              <h3 className="font-display font-black text-espresso text-base uppercase tracking-tight flex items-center gap-2">
                <PackageOpen className="h-5 w-5 text-roast" /> cargo control board
              </h3>
            </div>

            {selectedOrder ? (
              <div className="p-5 space-y-6">
                
                {/* Meta details */}
                <div className="space-y-3 pb-4 border-b border-cream">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-black text-espresso">{selectedOrder.id}</span>
                    <span className="text-[10px] text-steam font-mono">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</span>
                  </div>
                  
                  <div className="text-xs font-sans space-y-1 text-espresso">
                    <p><span>Patron:</span> <strong>{selectedOrder.guestName}</strong></p>
                    <p><span>Contact Email:</span> <span className="text-steam">{selectedOrder.guestEmail}</span></p>
                    <p><span>Rider Address:</span> <span className="text-steam font-medium">{selectedOrder.deliveryAddress}</span></p>
                  </div>
                </div>

                {/* Status Trigger controls */}
                <div className="space-y-3">
                  <label className="text-[10px] font-mono tracking-widest uppercase text-[#9B8675] font-black block">Modify Cargo Logistics State</label>
                  
                  {statusUpdating ? (
                    <div className="py-3 bg-espresso text-cream text-center text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border">
                      <Loader2 className="h-4 w-4 animate-spin text-latte" /> Writing logs...
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-black uppercase">
                      
                      {/* Confirm */}
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, OrderStatus.CONFIRMED)}
                        className={`py-2 px-2.5 rounded-lg border cursor-pointer transition-colors ${
                          selectedOrder.status === OrderStatus.CONFIRMED
                            ? "bg-leaf text-cream border-leaf"
                            : "bg-[#FAF7EF] hover:bg-cream border-cream/70 text-espresso"
                        }`}
                      >
                        Confirm payment
                      </button>

                      {/* Process */}
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, OrderStatus.PROCESSING)}
                        className={`py-2 px-2.5 rounded-lg border cursor-pointer transition-colors ${
                          selectedOrder.status === OrderStatus.PROCESSING
                            ? "bg-roast text-cream border-roast"
                            : "bg-[#FAF7EF] hover:bg-cream border-cream/70 text-espresso"
                        }`}
                      >
                        Process bean
                      </button>

                      {/* Dispatch courier */}
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, OrderStatus.DISPATCHED)}
                        className={`py-2 px-2.5 rounded-lg border cursor-pointer transition-colors ${
                          selectedOrder.status === OrderStatus.DISPATCHED
                            ? "bg-latte text-[#2C1503] border-latte"
                            : "bg-[#FAF7EF] hover:bg-cream border-cream/70 text-espresso"
                        }`}
                      >
                        Dispatch rider
                      </button>

                      {/* Deliver */}
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, OrderStatus.DELIVERED)}
                        className={`py-2 px-2.5 rounded-lg border cursor-pointer transition-colors ${
                          selectedOrder.status === OrderStatus.DELIVERED
                            ? "bg-emerald-600 text-[#FAF7EF] border-emerald-600"
                            : "bg-[#FAF7EF] hover:bg-cream border-cream/70 text-espresso"
                        }`}
                      >
                        Deliver cargo
                      </button>

                      {/* Cancel */}
                      <button
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, OrderStatus.CANCELLED)}
                        className="py-2 px-2.5 rounded-lg border bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 font-bold uppercase col-span-2 cursor-pointer transition-colors"
                      >
                        Decline order / Refund
                      </button>

                    </div>
                  )}
                </div>

                {/* Items drilldown */}
                <div className="space-y-3 pt-4 border-t border-cream">
                  <h5 className="text-[10px] font-mono tracking-widest text-[#9B8675] font-black uppercase">Packaging items checklist</h5>
                  
                  <div className="space-y-2.5">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs font-sans p-2 bg-[#FCFAF5] rounded-lg border border-cream/30">
                        <div>
                          <strong className="text-espresso block">{item.productName}</strong>
                          <span className="text-[10px] text-steam font-mono">{item.variantLabel}</span>
                        </div>
                        <span className="font-mono font-extrabold text-roast shrink-0 self-center">
                          x {item.qty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-[#9B8675] space-y-3 font-sans max-w-sm mx-auto">
                <ClipboardList className="h-10 w-10 text-latte mx-auto" />
                <h4 className="font-display font-bold text-sm text-espresso">No active cargo selected</h4>
                <p className="text-[11px] text-steam leading-relaxed">Choose a transaction in the direct orders register on the left to handle fulfillment controls.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
