import React, { useState } from "react";
import { Coffee, Sparkles, Send, Award, HelpCircle, Loader2, RefreshCw } from "lucide-react";

interface AISommelierProps {
  onRecommendBuy: (productId: string) => void;
}

export const AISommelier: React.FC<AISommelierProps> = ({ onRecommendBuy }) => {
  const [taste, setTaste] = useState("Bright citrus and blackcurrant acidity");
  const [method, setMethod] = useState("V60 / Pour-over");
  const [experience, setExperience] = useState("Coffee Enthusiast");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [sommelierText, setSommelierText] = useState("");
  const [showResult, setShowResult] = useState(false);

  // Common Taste presets representing gourmet descriptions
  const tastePresets = [
    { label: "Bright Citrus", value: "Bright citrus and blackcurrant acidity", desc: "For fans of zesty, refreshing highland notes." },
    { label: "Floral Jasmine", value: "Floral jasmine and delicate honey sweetness", desc: "For fans of light, complex, tea-like brews." },
    { label: "Chocolate & Caramel", value: "Bittersweet cocoa, caramel, and brown sugar", desc: "For fans of rich, sweet, heavy-body extractions." },
    { label: "Bold & Smokey", value: "Smoky dark cacao and toasted almond", desc: "For fans of bold, classic, standard espresso cups." }
  ];

  // Common brewing methods
  const brewMethods = ["French Press", "Espresso", "V60 / Pour-over", "AeroPress", "Moka Pot"];

  const handleRecommend = async () => {
    setIsGenerating(true);
    setShowResult(true);
    setSommelierText("");

    try {
      const response = await fetch("/api/coffee-sommelier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tastePreference: taste,
          brewMethod: method,
          experienceLabel: experience
        }),
      });

      if (!response.ok) {
        throw new Error("Sommelier server encountered a roaster clog.");
      }

      const data = await response.json();
      setSommelierText(data.recommendation);
    } catch (err) {
      console.error(err);
      setSommelierText("☕ **Sommelier Service Resting**\n\nFailed to sync with the smart roaster directly. We recommend trying **Mugi Signature Kenya AA** - perfect for bright brew structures!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans space-y-8 animate-fade-in-down">
      
      {/* Title block */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1 bg-[#FCF7EE] border border-cream text-roast px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase">
          <Sparkles className="h-4 w-4 text-gold animate-spin" /> Mugi AI Coffee Sommelier
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-espresso tracking-tight leading-none">
          Taste Analysis & Brewing Scribe
        </h1>
        <p className="text-sm text-steam max-w-lg mx-auto font-sans">
          Tell us about your favorite flavor palettes and chosen home brewing rigs. Our AI somatic Q-Grader checks Mt. Kenya's inventories to tailor recipes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Option inputs selector Panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-cream p-5 sm:p-6 shadow-md space-y-6">
          <h3 className="text-xs font-mono tracking-widest uppercase text-steam font-black border-b border-cream pb-3">
            Dial-in Preferences
          </h3>

          {/* TastePresets selector */}
          <div className="space-y-3">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#9B8675] font-bold block flex justify-between">
              <span>Aromatic Taste Profile</span>
              <span className="text-[8px] bg-cream text-roast px-1.5 rounded uppercase font-bold">Terroir matches</span>
            </label>
            <div className="space-y-2">
              {tastePresets.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setTaste(t.value)}
                  className={`w-full text-left p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    taste === t.value
                      ? "bg-roast/5 border-roast ring-1 ring-roast"
                      : "bg-[#FAF7EF]/40 border-cream hover:border-latte"
                  }`}
                >
                  <p className="font-bold text-espresso">{t.label}</p>
                  <p className="text-[9px] text-[#9B8675] leading-normal font-normal mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Brew Rig Selector */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#9B8675] font-bold block">Chosen Extraction rig</label>
            <div className="flex flex-wrap gap-2">
              {brewMethods.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`py-2 px-3.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                    method === m
                      ? "bg-roast text-cream border-roast"
                      : "bg-[#FCFAF4] border-cream text-espresso/80 hover:border-latte"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Expertise Depth slider */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#9B8675] font-bold block">Your Coffee Experience level</label>
            <div className="grid grid-cols-3 gap-2 text-center">
              {["Novice", "Coffee Enthusiast", "Professional Barista"].map((exp) => (
                <button
                  key={exp}
                  type="button"
                  onClick={() => setExperience(exp)}
                  className={`py-2 px-1 rounded-lg border text-[10px] font-bold cursor-pointer transition-colors ${
                    experience === exp
                      ? "bg-roast text-cream border-roast font-extrabold"
                      : "bg-[#FCFAF4] border-cream text-espresso/70 hover:border-latte"
                  }`}
                >
                  {exp.replace("Professional ", "")}
                </button>
              ))}
            </div>
          </div>

          {/* Scent recommendations CTA */}
          <button
            onClick={handleRecommend}
            disabled={isGenerating}
            className="w-full py-3.5 bg-espresso hover:bg-roast text-cream disabled:bg-steam font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2.5 cursor-pointer focus:outline-none"
          >
            {isGenerating ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin text-latte" />
            ) : (
              <Sparkles className="h-4.5 w-4.5 text-gold animate-bounce" />
            )}
            Analyze bean recommendation
          </button>
        </div>

        {/* Right Sommelier AI response panel Column */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-cream shadow-md overflow-hidden flex flex-col h-full min-h-[460px]">
            
            {/* Sommelier Header status */}
            <div className="bg-[#FAF7EF] px-6 py-4.5 border-b border-cream flex justify-between items-center">
              <h3 className="font-display font-black text-espresso text-base uppercase tracking-tight flex items-center gap-2">
                <Coffee className="h-5 w-5 text-roast shrink-0" /> Sommelier Output Register
              </h3>
              <HelpCircle className="h-4 w-4 text-steam cursor-help" title="Ask regarding origins, ratios, grind structures etc." />
            </div>

            {/* Sommelier Response Box */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              {showResult ? (
                <div className="space-y-4">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 font-mono">
                      <RefreshCw className="h-10 w-10 text-latte animate-spin" />
                      <div className="space-y-1">
                        <p className="text-xs font-black text-espresso">Mugi AI Sommelier analyzing terroir profiles...</p>
                        <p className="text-[10px] text-steam uppercase tracking-wider">Matching high-altitude MASL notes with your rigs</p>
                      </div>
                    </div>
                  ) : (
                    <div className="prose text-xs text-espresso/85 leading-relaxed font-sans max-w-none space-y-3 whitespace-pre-line bg-[#FCFAF5] p-5 rounded-2xl border border-cream/50">
                      {sommelierText}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="bg-cream/40 p-5 rounded-full">
                    <Sparkles className="h-12 w-12 text-gold animate-pulse" />
                  </div>
                  <h4 className="font-display font-bold text-lg text-espresso">Experience Hand-Crafted Sommelier Wisdom</h4>
                  <p className="text-xs text-steam max-w-xs mx-auto leading-relaxed pr-1">
                    Once you dial in your favor tastes and rigging, click the analysis trigger to generate step-by-step ratio weights, brewing temperatures, and custom grinds tailored dynamically using server-side Gemini.
                  </p>
                </div>
              )}

              {/* BUY QUICK ACTION */}
              {showResult && !isGenerating && (
                <div className="border-t border-cream/80 pt-4 flex gap-4 items-center">
                  <div className="grow">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-steam font-bold">Suggested blend match</p>
                    <strong className="text-xs font-display text-espresso block mt-0.5">
                      {sommelierText.includes("Peaberry") ? "Mugi Peaberry Reserve" : sommelierText.includes("Dark Ridge") ? "Mugi Dark Ridge Espresso" : "Mugi Signature Kenya AA"}
                    </strong>
                    <span className="text-[9px] font-mono text-steam">Sourced from Kenyan micro-lots</span>
                  </div>
                  <button
                    onClick={() => {
                      const selection = sommelierText.includes("Peaberry") ? "prod-peaberry" : sommelierText.includes("Dark Ridge") ? "prod-dark-ridge" : "prod-signature-aa";
                      onRecommendBuy(selection);
                    }}
                    className="px-6 py-2.5 bg-roast hover:bg-espresso text-cream text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Details & Buy
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
};
