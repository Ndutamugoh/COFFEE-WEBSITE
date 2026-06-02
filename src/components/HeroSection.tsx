import React from "react";
import { Coffee, ShieldCheck, Heart, Sparkles, Navigation } from "lucide-react";
import MugiLogo from "../assets/images/mugi_brand_logo_1780392188840.png";

interface HeroSectionProps {
  onShopBtnClick: () => void;
  onSommelierBtnClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onShopBtnClick, onSommelierBtnClick }) => {
  return (
    <div 
      className="relative overflow-hidden bg-espresso bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat text-cream py-16 sm:py-24 transition-colors"
    >
      {/* Darkened Overlays for Legibility and High Contrast Integration */}
      <div className="absolute inset-0 bg-espresso/60 backdrop-blur-[0.5px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso via-transparent to-espresso/35" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-espresso to-transparent" />

      {/* Decorative Warm Backlighting */}
      <div className="absolute top-0 right-0 -mr-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-latte/12 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-roast/15 to-transparent blur-3xl pointer-events-none" />

      {/* Subtle Grid / Noise Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Headline and Copy */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-leaf/25 border border-leaf/45 text-xs font-mono tracking-widest text-[#E6FFFA] uppercase animate-pulse drop-shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-sprout" />
              100% Hand-Sorted Organic Highland Arabica
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6.5xl font-black tracking-tight leading-[1.05] drop-shadow-md">
              From Mt. Kenya's <span className="text-sprout italic underline decoration-leaf decoration-wavy">Highlands</span> <br />
              to Your Cup
            </h1>
            
            <p className="font-heading text-lg sm:text-xl text-cream/90 max-w-2xl leading-relaxed drop-shadow">
              Mugi Coffee serves pure high-altitude grains grown at <strong className="text-cream text-md">2020 MASL</strong>. freshly drum-roasted, wet-processed, and express-delivered across <strong className="text-cream underline decoration-leaf decoration-2">Nairobi and Naivasha</strong>.
            </p>

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onShopBtnClick}
                className="px-8 py-4 bg-latte hover:bg-[#B78155] text-[#2C1503] font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
              >
                <Coffee className="h-5 w-5" />
                Shop Boutique Beans
              </button>
              <button
                onClick={onSommelierBtnClick}
                className="px-8 py-4 bg-espresso border border-cream/20 hover:bg-cream/5 text-cream font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
              >
                <Sparkles className="h-5 w-5 text-gold" />
                Consult AI Sommelier
              </button>
            </div>

            {/* Micro Badges inside Left Panel */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-2 text-xs font-mono text-cream/70 bg-cream/[0.03] p-3 rounded-lg border border-cream/[0.05]">
                <ShieldCheck className="h-4 w-4 text-leaf shrink-0" />
                <span>M-PESA Pusher</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-cream/70 bg-cream/[0.03] p-3 rounded-lg border border-cream/[0.05]">
                <Coffee className="h-4 w-4 text-latte shrink-0" />
                <span>2020 MASL Grains</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-cream/70 bg-cream/[0.03] p-3 rounded-lg border border-cream/[0.05]">
                <Navigation className="h-4 w-4 text-gold shrink-0" />
                <span>NBO & NV express</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-cream/70 bg-cream/[0.03] p-3 rounded-lg border border-cream/[0.05]">
                <Heart className="h-4 w-4 text-rose-400 shrink-0" />
                <span>Washed Process</span>
              </div>
            </div>
          </div>

          {/* Sourcing Visual Packshot (Right) */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center">
            <div className="relative group max-w-sm w-full">
              {/* Animated Glow Border */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-latte to-gold rounded-3xl blur opacity-30 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              
              {/* Product Pack Mockup Card */}
              <div className="relative bg-milk text-espresso rounded-2xl overflow-hidden shadow-2xl p-6 border border-cream/50 transition-all flex flex-col justify-between">
                
                {/* Brand label top */}
                <div className="flex justify-between items-start mb-4 border-b border-cream/40 pb-4">
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-espresso p-0.5 border border-cream/20 shrink-0">
                      <img src={MugiLogo} alt="Mugi Logo" className="w-full h-full object-cover scale-105" />
                    </div>
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[#9B8675]">Bourbon Arabica</span>
                      <h4 className="font-display font-black text-lg text-espresso m-0 leading-none">MUGI COFFEE</h4>
                    </div>
                  </div>
                  <span className="bg-leaf/10 text-leaf text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded">
                    Washed / Wet Processed
                  </span>
                </div>

                {/* Sourcing photo banner aspect */}
                <div className="h-48 rounded-xl overflow-hidden mb-5 bg-[#ECE3CC] relative">
                  <img
                    src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=600&auto=format&fit=crop"
                    alt="Mt. Kenya highlands coffee farms"
                    className="w-full h-full object-cover grayscale-20 brightness-110 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-3 left-3 bg-espresso/80 backdrop-blur-sm text-cream px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider flex items-center gap-1.5 border border-cream/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Mt. Kenya Slopes
                  </div>
                </div>

                {/* Packet Technical Details */}
                <div className="space-y-3 font-sans pb-4">
                  <div className="text-center bg-[#F4F0E4] py-2 rounded-lg border border-cream/70 flex flex-col items-center">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#9B8675] mb-0.5">Primary Grade</span>
                    <h3 className="font-display font-extrabold text-xl text-roast leading-none">Pristine Kenya AA</h3>
                    <p className="text-[10px] font-mono text-steam mt-1">250g bag · Sourced at 2020 MASL</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                    <div className="bg-[#FAF7EF] p-2 rounded border border-cream/50">
                      <span className="block text-steam mb-0.5">Roast</span>
                      <strong className="text-roast uppercase text-xs">Medium</strong>
                    </div>
                    <div className="bg-[#FAF7EF] p-2 rounded border border-cream/50">
                      <span className="block text-steam mb-0.5 font-sans">Acidity</span>
                      <strong className="text-roast uppercase text-xs">Bright Citrus</strong>
                    </div>
                    <div className="bg-[#FAF7EF] p-2 rounded border border-cream/50">
                      <span className="block text-steam mb-0.5">Finish</span>
                      <strong className="text-roast uppercase text-xs">Dark Cacao</strong>
                    </div>
                  </div>
                </div>

                {/* Action in Packshot */}
                <button
                  onClick={onShopBtnClick}
                  className="w-full py-2.5 bg-espresso hover:bg-roast text-cream text-xs font-bold font-sans uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Order This Roast · KES 750
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
