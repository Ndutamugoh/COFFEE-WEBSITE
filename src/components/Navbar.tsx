import React, { useState } from "react";
import { 
  Coffee, 
  ShoppingCart, 
  Menu, 
  X, 
  ShieldAlert, 
  Award, 
  Home, 
  ShoppingBag, 
  Sparkles, 
  Leaf, 
  ChevronRight 
} from "lucide-react";
import { useCart } from "../context/CartContext";
import MugiLogo from "../assets/images/mugi_brand_logo_1780392188840.png";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenCart }) => {
  const { cart } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const navItems = [
    { id: "home", label: "Home", icon: Home, desc: "Welcome & Spotlights" },
    { id: "shop", label: "Shop Boutique", icon: ShoppingBag, desc: "Explore our specialty roasts" },
    { id: "sommelier", label: "AI Sommelier", icon: Sparkles, desc: "Interactive curation" },
    { id: "about", label: "Our Sourcing", icon: Leaf, desc: "Highlands narrative" },
    { id: "admin", label: "Admin Board", icon: ShieldAlert, desc: "Manage orders & prices" },
  ];

  return (
    <>
      <nav id="top-navbar" className="sticky top-0 z-40 bg-milk/95 border-b border-cream backdrop-blur-md shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Left Section: Menu Button & Brand */}
            <div className="flex items-center gap-4">
              {/* Collapsible Menu Button */}
              <button
                id="menu-toggle-btn"
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-espresso hover:bg-cream/40 border border-cream/50 transition-all focus:outline-none cursor-pointer group"
                aria-label="Open Navigation Menu"
              >
                <Menu className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="hidden sm:inline font-mono text-[11px] font-bold uppercase tracking-wider">
                  Menu
                </span>
              </button>

              {/* Logo Brand */}
              <div
                id="navbar-brand-logo"
                onClick={() => onNavigate("home")}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="bg-espresso text-cream p-1 rounded-xl group-hover:bg-[#1E1102] transition-colors shadow-md w-11 h-11 flex items-center justify-center overflow-hidden border border-cream/20 md:w-12 md:h-12">
                  <img 
                    src={MugiLogo} 
                    alt="Mugi Coffee Logo" 
                    className="w-full h-full object-cover scale-110" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div>
                  <div className="font-display text-xl md:text-2xl font-black tracking-tight text-espresso flex items-center gap-1.5 leading-none">
                    MUGI <span className="text-[9px] font-sans font-bold text-leaf px-1.5 py-0.5 rounded-full bg-sprout/25 border border-leaf/10 flex items-center gap-0.5"><Award className="h-2.5 w-2.5" /> DIRECT</span>
                  </div>
                  <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-widest text-leaf group-hover:text-matcha transition-colors mt-0.5 font-bold">
                    gomugi.com · Sourcing Wisdom
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Section: Empty (Top menu navigation removed strictly as requested) */}
            <div className="hidden lg:flex items-center">
              <span className="text-[10px] font-mono tracking-wider font-semibold text-leaf/50 px-3 py-1 rounded-full bg-sprout/10 border border-leaf/5">
                ● Highland Sourced (2020 MASL)
              </span>
            </div>

            {/* Right Section: Shopping Cart Actions */}
            <div className="flex items-center space-x-4">
              <button
                id="cart-toggle-btn"
                onClick={onOpenCart}
                className="relative p-2.5 text-espresso hover:text-roast hover:bg-cream/40 rounded-xl transition-all border border-transparent hover:border-cream/60 focus:outline-none cursor-pointer group"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="h-6 w-6 transition-transform group-hover:scale-105" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-leaf text-cream text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-milk animate-bounce">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Collapsible Sidebar Overlay Backdrop */}
      <div
        id="sidebar-backdrop"
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-50 bg-espresso/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Collapsible Drawer Sidebar */}
      <aside
        id="collapsible-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 w-80 bg-milk border-r border-cream shadow-2xl flex flex-col justify-between py-6 px-6 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Soft Logo Watermark Background of the entire menu sidebar */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
          <img 
            src={MugiLogo} 
            alt="Logo Watermark" 
            className="w-[120%] h-auto opacity-[0.05] filter grayscale scale-110 object-contain rotate-12" 
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Sidebar Header & Links Block */}
        <div className="relative z-10 space-y-6">
          
          {/* Sidebar Header with Logo, Name and Motto */}
          <div className="flex items-center justify-between border-b border-cream/70 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-espresso p-0.5 border border-cream/35 shadow-md shrink-0">
                <img 
                  src={MugiLogo} 
                  alt="Mugi Logo Thumbnail" 
                  className="w-full h-full object-cover scale-110" 
                />
              </div>
              <div>
                <h4 className="font-display font-black text-[15px] text-espresso uppercase tracking-tight leading-none m-0">
                  Mugi Coffee
                </h4>
                <span className="font-serif italic text-[11px] text-roast font-bold block mt-0.5 leading-none">
                  "Wisdom Served"
                </span>
              </div>
            </div>
            
            <button
              id="sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-espresso hover:bg-cream/50 rounded-lg transition-colors border border-transparent hover:border-cream/50 focus:outline-none cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sourcing Badge Accent */}
          <div className="bg-sprout/15 border border-leaf/10 p-3 rounded-xl flex items-center gap-2.5 shadow-xs">
            <Leaf className="h-4 w-4 text-leaf shrink-0 animate-pulse" />
            <div className="text-[10px]">
              <span className="block font-bold text-espresso leading-none">2020 MASL Highland Sourced</span>
              <span className="text-steam leading-tight">Hand-picked heirloom Arabica cherries</span>
            </div>
          </div>

          {/* Navigation Links List */}
          <nav id="sidebar-nav-items" className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between py-3 px-3.5 rounded-xl text-left border cursor-pointer transition-all ${
                    isActive
                      ? "bg-leaf text-cream border-leaf shadow-sm"
                      : "bg-transparent text-espresso/80 border-transparent hover:bg-cream/40 hover:text-espresso"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isActive ? "bg-cream/15 text-cream" : "bg-cream/25 text-leaf"}`}>
                      {item.icon && <item.icon className="h-4 w-4" />}
                    </div>
                    <div>
                      <span className="font-display text-sm font-bold block leading-none">
                        {item.label}
                      </span>
                      <span className={`text-[9px] font-mono block mt-0.5 ${isActive ? "text-sprout" : "text-steam"}`}>
                        {item.desc}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 opacity-70 transition-transform ${isActive ? "translate-x-0.5 text-cream" : "text-espresso/30"}`} />
                </button>
              );
            })}
          </nav>

        </div>

        {/* Sidebar Footer */}
        <div className="relative z-10 pt-4 border-t border-cream/75 text-center space-y-1 font-mono text-[9px] text-steam/80">
          <p>© {new Date().getFullYear()} Mugi Coffee Co.</p>
          <p className="text-leaf font-bold">gomugi.com · Nairobi & Naivasha</p>
        </div>
      </aside>
    </>
  );
};
