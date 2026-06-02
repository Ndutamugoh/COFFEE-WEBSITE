import React, { useState } from "react";
import { Coffee, Award, Sparkles, Navigation, Globe, PhoneCall, Heart, Search, Filter, ShoppingBag, Eye, HelpCircle } from "lucide-react";
import { CartProvider, useCart } from "./context/CartContext";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { CartDrawer } from "./components/CartDrawer";
import { ProductDetailsModal } from "./components/ProductDetailsModal";
import { CheckoutForm } from "./components/CheckoutForm";
import { OrderTracker } from "./components/OrderTracker";
import { AdminDashboard } from "./components/AdminDashboard";
import { AISommelier } from "./components/AISommelier";
import { SEED_PRODUCTS } from "./data/coffeeData";
import { Product, Category } from "./types";

function MainAppContent() {
  const { cart } = useCart();
  
  // Custom router state coordinates
  const [currentView, setCurrentView] = useState<string>("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Shop filter parameters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "ALL">("ALL");

  // Tracked order parameters
  const [trackedOrderId, setTrackedOrderId] = useState<string>("");

  // Notification Banner State
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  const triggerToast = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleRecommendBuy = (productId: string) => {
    const matched = SEED_PRODUCTS.find((p) => p.id === productId);
    if (matched) {
      setSelectedProduct(matched);
      setDetailModalOpen(true);
    }
  };

  // Filtered boutique catalog calculation
  const filteredProducts = SEED_PRODUCTS.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.origin.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === "ALL" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-milk font-sans relative">
      
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-espresso text-cream px-5 py-3 rounded-xl shadow-2xl border border-cream/20 flex items-center gap-3 animate-bounce">
          <Sparkles className="h-4.5 w-4.5 text-gold animate-spin" />
          <span className="text-xs font-semibold">{notificationMsg}</span>
        </div>
      )}

      {/* Top sticky navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenCart={() => setCartOpen(true)}
      />

      {/* Slideout Shopping Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setCurrentView("checkout");
        }}
      />

      {/* Specialty Bean Detail Overlay */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onAddedSuccess={() => triggerToast("Added premium highlands roast to basket successfully!")}
      />

      {/* Dynamic Main Body Content */}
      <main className="flex-grow">
        {currentView === "home" && (
          <div className="space-y-16 pb-16">
            
            {/* Split layout editorial Banner */}
            <HeroSection
              onShopBtnClick={() => setCurrentView("shop")}
              onSommelierBtnClick={() => setCurrentView("sommelier")}
            />

            {/* Quick Sourcing Badges */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Award, label: "Specialty Bourbon AA Only", desc: "No second-grade bulk coffee. Sorted by hand." },
                { icon: Navigation, label: "Nairobi & Naivasha express", desc: "Sameday boda-boda dispatching & next-day cargo." },
                { icon: Globe, label: "Ethic direct compensation", desc: "Distributing directly from highland small-holder farming families." },
                { icon: Coffee, label: "Fresh drum-roasting", desc: "Roasted weekly in small batches keeping aroma locked." }
              ].map((b, i) => (
                <div key={i} className="bg-white rounded-2xl border border-cream p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-[#FAF6EC] text-roast p-2.5 rounded-xl w-10 h-10 flex items-center justify-center border border-cream/50">
                    <b.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-espresso">{b.label}</h4>
                    <p className="text-[10px] text-steam leading-relaxed mt-1">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Signature Catalog Spotlight section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="text-center space-y-2">
                <span className="text-[9px] font-mono tracking-widest text-[#9B8675] uppercase font-bold">Specialty Reserve Spotlight</span>
                <h2 className="font-display font-black text-2.5xl sm:text-3.5xl text-espresso tracking-tight leading-none">
                  Our Hand-Picked Specialty Roasts
                </h2>
                <p className="text-xs text-steam font-sans leading-none">
                  Small-batch reserves sourced from Mt. Kenya's slopes and Aberdares highlands.
                </p>
              </div>

              {/* Showcase list with slider hover animation cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {SEED_PRODUCTS.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setDetailModalOpen(true);
                    }}
                    className="bg-white rounded-2xl overflow-hidden border border-cream shadow-sm hover:shadow-md hover:-translate-y-1 transform transition-all cursor-pointer flex flex-col justify-between group h-[400px]"
                  >
                    <div>
                      {/* Image container frame */}
                      <div className="h-44 bg-[#ECE3CC] relative overflow-hidden">
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-3 left-3 bg-espresso/80 backdrop-blur-sm text-cream px-2 py-0.5 rounded text-[9px] font-mono border border-cream/10">
                          {prod.origin.split("—")[0]}
                        </span>
                      </div>

                      {/* Decors */}
                      <div className="p-4 space-y-2">
                        <div className="flex gap-1.5 flex-wrap">
                          {prod.tastingNotes.slice(0, 2).map((n) => (
                            <span key={n} className="bg-[#FAF7EF] text-steam px-2 py-0.5 rounded text-[9px] font-mono border border-cream/50 capitalize">
                              {n}
                            </span>
                          ))}
                        </div>

                        <h3 className="font-display font-black text-sm text-espresso group-hover:text-roast transition-colors tracking-tight leading-shorter">
                          {prod.name}
                        </h3>

                        <p className="text-[10px] text-steam leading-relaxed font-sans line-clamp-3">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom price action */}
                    <div className="p-4 pt-0 flex justify-between items-center border-t border-cream/30">
                      <div>
                        <span className="text-[9px] font-mono text-[#9B8675] uppercase tracking-wide block">Starting at</span>
                        <strong className="text-sm font-mono text-roast">KES {prod.variants[0].priceKes}</strong>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-latte flex items-center gap-1">
                        View Bags <Eye className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sourcing values brand panel */}
            <div className="bg-espresso text-cream py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <span className="text-xs font-mono text-latte uppercase tracking-widest font-black">Wisdom Served Sourcing</span>
                  <h3 className="font-display font-black text-2.5xl sm:text-3.5xl tracking-tight leading-none">
                    Wet-Mill double-washed process ensuring flawless flavor extraction
                  </h3>
                  <p className="text-xs text-cream/75 leading-relaxed font-sans">
                    Mount Kenya highlands represent the holy grail of global coffee farming (MASL 2020). The constant chill, direct equatorial solar, and volcanic soils delay coffee cherry ripening, letting deep complex sugars fully develop in the reserve bean.
                  </p>
                  <p className="text-xs text-cream/75 leading-relaxed font-sans">
                    Mugi coffee works directly with regional wet mill factories (Nyeri, Kirinyaga) paying premiums over trade indices directly to coffee grower cooperatives, empowering local Nairobi highlands.
                  </p>
                  
                  <div className="pt-4 flex gap-4">
                    <button
                      onClick={() => setCurrentView("about")}
                      className="px-6 py-3 bg-latte text-espresso font-bold rounded-lg text-xs transition-transform transform active:scale-95 cursor-pointer"
                    >
                      Our Sourcing Story
                    </button>
                    <button
                      onClick={() => setCurrentView("sommelier")}
                      className="px-6 py-3 border border-cream/20 text-cream rounded-lg text-xs font-semibold hover:bg-cream/5 transition-colors cursor-pointer"
                    >
                      AI Brewing Guides
                    </button>
                  </div>
                </div>

                {/* Sourcing illustrative badge graphics */}
                <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                  {[
                    { title: "2020 MASL", label: "Mountain Highlands", desc: "Slow ripening developing rich citrus and honey acidity." },
                    { title: "Bourbon SL28", label: "Specialty Cultivar", desc: "Elite heirloom variety celebrated for berries profiles." },
                    { title: "Wet Processed", label: "Double Washed Mill", desc: "Clean, syrupy, and clear tasting profiles." },
                    { title: "M-PesaSTK", label: "Daraja v2 Payments", desc: "Fast PIN consent directly on your smartphone screen." }
                  ].map((it, idx) => (
                    <div key={idx} className="bg-white/5 border border-cream/5 p-5 rounded-2xl space-y-2">
                      <h4 className="font-display font-black text-2xl text-latte">{it.title}</h4>
                      <strong className="text-xs font-sans text-cream block">{it.label}</strong>
                      <p className="text-[10px] text-cream/75 leading-relaxed font-sans">{it.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Newsletter widget capture section */}
            <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
              <h3 className="font-display font-black text-2xl text-espresso tracking-tight leading-none">Join the Mugi Coffee Society</h3>
              <p className="text-xs text-steam max-w-md mx-auto">Receive updates on our fresh highland roasts, microlot arrivals, and custom brewing tutorials directly.</p>
              
              <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
                <input
                  type="email"
                  placeholder="Diana.mugoh.va@gmail.com"
                  className="bg-[#FAF7EF] border border-cream focus:border-latte focus:ring-1 focus:ring-latte text-xs px-4 py-2.5 rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => triggerToast("✨ Welcome! We've registered your email for 10% coupon codes!")}
                  className="px-5 py-2.5 bg-roast text-cream hover:bg-espresso text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Join Society
                </button>
              </div>
            </div>

          </div>
        )}

        {currentView === "shop" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="font-display font-black text-3xl text-espresso tracking-tight">Shop Coffee Boutique</h1>
                <p className="text-xs text-steam font-normal mt-1">Gourmet bags grown at high altitudes to unlock premium clarity.</p>
              </div>

              {/* Shopping basket guide stats */}
              <div className="bg-[#FAF7EF] rounded-xl px-4 py-2 border border-cream flex items-center gap-2 text-xs">
                <ShoppingBag className="h-4.5 w-4.5 text-roast" />
                <span>Selected: <strong className="text-roast">{cart.reduce((sum,item)=>sum+item.qty,0)} bags</strong></span>
              </div>
            </div>

            {/* Filtering Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#FAF7EF]/40 border border-cream p-4 rounded-xl">
              {/* Search */}
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-steam" />
                <input
                  type="text"
                  placeholder="e.g. Peaberry, Kirinyaga..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-cream focus:border-latte rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-latte focus:outline-none"
                />
              </div>

              {/* Categorization chips */}
              <div className="flex gap-2 flex-wrap justify-center w-full md:w-auto">
                {[
                  { id: "ALL", label: "All Items" },
                  { id: Category.WHOLE_BEAN, label: "Whole Beans" },
                  { id: Category.GROUND, label: "Ground Bags" },
                  { id: Category.INSTANT, label: "Soluble Instant" },
                  { id: Category.MERCHANDISE, label: "Mugi Design Merch" }
                ].map((catItem) => (
                  <button
                    key={catItem.id}
                    onClick={() => setSelectedCategory(catItem.id as any)}
                    className={`py-1.5 px-3.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                      selectedCategory === catItem.id
                        ? "bg-leaf text-cream border-leaf"
                        : "bg-white border-cream text-espresso/70 hover:border-leaf"
                    }`}
                  >
                    {catItem.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filtered products catalog list */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-steam font-normal">
                No specialty coffee found matching query. Try another keyword!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setDetailModalOpen(true);
                    }}
                    className="bg-white rounded-2xl overflow-hidden border border-cream shadow-sm hover:shadow-md hover:-translate-y-1 transform transition-all cursor-pointer flex flex-col justify-between group h-[400px]"
                  >
                    <div>
                      {/* Image container frame */}
                      <div className="h-44 bg-[#ECE3CC] relative overflow-hidden">
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-3 left-3 bg-espresso/80 backdrop-blur-sm text-cream px-2 py-0.5 rounded text-[9px] font-mono border border-cream/10">
                          {prod.origin.split("—")[0]}
                        </span>
                      </div>

                      {/* Decors */}
                      <div className="p-4 space-y-2">
                        <div className="flex gap-1.5 flex-wrap">
                          {prod.tastingNotes.slice(0, 2).map((n) => (
                            <span key={n} className="bg-[#FAF7EF] text-steam px-2 py-0.5 rounded text-[9px] font-mono border border-cream/50 capitalize">
                              {n}
                            </span>
                          ))}
                        </div>

                        <h3 className="font-display font-black text-sm text-espresso group-hover:text-roast transition-colors tracking-tight leading-shorter">
                          {prod.name}
                        </h3>

                        <p className="text-[10px] text-steam leading-relaxed font-sans line-clamp-3">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom price action */}
                    <div className="p-4 pt-0 flex justify-between items-center border-t border-cream/30">
                      <div>
                        <span className="text-[9px] font-mono text-[#9B8675] uppercase tracking-wide block">Starting at</span>
                        <strong className="text-sm font-mono text-roast">KES {prod.variants[0].priceKes}</strong>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-latte flex items-center gap-1">
                        View Bags <Eye className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === "sommelier" && (
          <AISommelier onRecommendBuy={handleRecommendBuy} />
        )}

        {currentView === "checkout" && (
          <CheckoutForm
            onOrderCompleted={(id) => {
              setTrackedOrderId(id);
              setCurrentView("tracker");
            }}
            onBackToShop={() => setCurrentView("shop")}
          />
        )}

        {currentView === "tracker" && (
          <div className="max-w-4xl mx-auto px-4 py-8 font-sans space-y-6">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Lookup Order Code (e.g. MUGI-1234)"
                value={trackedOrderId}
                onChange={(e) => setTrackedOrderId(e.target.value)}
                className="bg-[#FAF7EF] border border-cream rounded-xl focus:border-latte px-4 py-2.5 text-xs w-full focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (trackedOrderId.trim()) {
                    triggerToast("Synchronized order tracker coordinates.");
                  }
                }}
                className="px-5 py-2.5 bg-roast hover:bg-espresso text-cream font-bold rounded-xl text-xs shrink-0 cursor-pointer"
              >
                Sync code
              </button>
            </div>

            <OrderTracker
              orderId={trackedOrderId}
              onBackToShop={() => setCurrentView("shop")}
            />
          </div>
        )}

        {currentView === "admin" && <AdminDashboard />}

        {currentView === "about" && (
          <div className="max-w-4xl mx-auto px-4 py-8 font-sans space-y-12 animate-fade-in-down">
            <div className="text-center space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#9B8675] font-black">boutique wisdom</span>
              <h1 className="font-display font-black text-3.5xl text-espresso tracking-tight leading-none">
                Our Sourcing story
              </h1>
              <p className="text-xs text-steam max-w-sm mx-auto">How we harvest premium quality Mount Kenya wet-washed grains.</p>
            </div>

            {/* Main story panel layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white border border-cream shadow rounded-2xl overflow-hidden">
              <div className="md:col-span-5 h-[360px] bg-[#ECE3CC] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop"
                  alt="Specialty bags"
                  className="w-full h-full object-cover grayscale-10"
                />
              </div>

              <div className="md:col-span-7 p-6 sm:p-8 space-y-4 text-xs text-espresso/80 leading-relaxed font-sans pr-8">
                <h3 className="font-display font-bold text-lg text-espresso pb-2 border-b border-cream">Traditional Crop Hand-picking values</h3>
                <p>
                  At Mugi Coffee, we harvest premium heirloom Bourbon trees grown under Aberdares canopy shade. Our cooperative farmers strictly select deep-crimson ripened cherries, ignoring unripe greens or yellow crops.
                </p>
                <p>
                  Cherries pass through our double-pulping wet mills under Mt. Kenya spring water channels before undergoing a 36-hour aerobic fermentation. This washes away seed mucilage completely, bringing out raw pristine acidity elements, citric aromas, and trademark chocolate body.
                </p>
                <p>
                  Grains are dried slowly on custom elevated african tables under precise solar radiation measurements. Hand-turned every 30 minutes, they develop moisture equilibria perfect to prevent rot or flavor dilution during transport.
                </p>
              </div>
            </div>

            {/* Sourcing credentials map specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { title: "Nyeri Sourcing", desc: "Acids profile: Sweet red berries with sharp blackcurrant overtones. Altitude: 1950 - 2040 MASL." },
                { title: "Kirinyaga Sourcing", desc: "Profile flavor: Citrus lime blossom notes, deep honey and cacao finish. Altitude: 1800 - 1980 MASL." },
                { title: "Aberdares Sourcing", desc: "Acids profile: Creamy vanilla and toasted nut body. Dried cherry processing. Altitude: 1750 - 1880 MASL." }
              ].map((loc, i) => (
                <div key={i} className="bg-[#FAF7EF] rounded-xl border border-cream p-4 space-y-2">
                  <h4 className="font-display font-bold text-sm text-[#2C1503]">{loc.title}</h4>
                  <p className="text-[10px] text-steam leading-relaxed font-sans">{loc.desc}</p>
                </div>
              ))}
            </div>

          </div>
        )}
      </main>

      {/* Gourmet Footer */}
      <footer className="bg-espresso text-cream border-t border-cream/10 pt-12 pb-6 flex flex-col items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 md:grid-cols-12 gap-8 text-xs pb-10 border-b border-cream/10">
          
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-cream" />
              <strong className="font-display font-black text-cream text-lg tracking-tight uppercase">Mugi Coffee</strong>
            </div>
            <p className="text-cream/70 leading-relaxed font-sans pr-6">
              Gourmet boutique coffee distributor serving pure high-altitude Kenyan AA microlots across Nairobi & Naivasha. Pay securely with Safaricom M-Pesa.
            </p>
          </div>

          <div className="md:col-span-3 space-y-2">
            <strong className="text-[10px] font-mono uppercase tracking-widest text-latte font-black">Region hubs</strong>
            <p className="text-cream/80 font-sans leading-relaxed">Nairobi CBD: Central Business Tower & Wet Cafe Hub</p>
            <p className="text-cream/80 font-sans leading-relaxed font-normal">Naivasha Depot: Off highway bypass distribution terminal</p>
          </div>

          <div className="md:col-span-3 space-y-2">
            <strong className="text-[10px] font-mono uppercase tracking-widest text-latte font-black">Patron Hotlines</strong>
            <p className="font-mono text-[10px] text-cream/80 leading-relaxed">Nbi Roastery: +254 791 291 281</p>
            <p className="font-mono text-[10px] text-cream/80 leading-relaxed font-normal">Nv Depot: +254 728 372 031</p>
          </div>

          <div className="md:col-span-2 space-y-2">
            <strong className="text-[10px] font-mono uppercase tracking-widest text-latte font-black">Specialty Certs</strong>
            <span className="inline-block bg-creams text-leaf text-[9px] font-mono font-bold uppercase tracking-wider bg-[#EDF5EE] px-2 py-0.5 rounded border border-emerald-100">
              Q-Grader Reserve
            </span>
          </div>

        </div>

        <div className="pt-6 text-center text-cream/55 font-mono text-[10px] space-y-1 w-full max-w-7xl px-4 flex flex-col sm:flex-row justify-between items-center bg-espresso gap-2">
          <span>&copy; {new Date().getFullYear()} Mugi Coffee Ltd. Nairobi wet-cooperative. Sourcing wisdom with passion.</span>
          <span className="text-[#9B8675]">Licensed distribution B2C and Light B2B.</span>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <MainAppContent />
    </CartProvider>
  );
}
