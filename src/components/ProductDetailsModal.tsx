import React, { useState, useEffect } from "react";
import { X, Award, ChevronRight, Sparkles, Scale, Coffee, ShoppingCart, HelpCircle } from "lucide-react";
import { Product, ProductVariant, GrindType } from "../types";
import { useCart } from "../context/CartContext";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddedSuccess: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddedSuccess,
}) => {
  const { addToCart } = useCart();

  // Determine available weights and custom grinds safely
  const weights: number[] = product
    ? Array.from(new Set<number>(product.variants.map((v) => v.weightGrams))).sort((a: number, b: number) => a - b)
    : [];
  const grinds = product
    ? Array.from(new Set(product.variants.map((v) => v.grindType).filter((g) => g !== undefined))) as GrindType[]
    : [];

  // Choose sensible default selections with safe initializers
  const [selectedWeight, setSelectedWeight] = useState<number>(() => {
    return weights[0] || 0;
  });
  const [selectedGrind, setSelectedGrind] = useState<GrindType | "">(() => {
    return grinds.length > 0 ? grinds[0] : "";
  });
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState<string>(() => {
    return product?.images[0] || "";
  });

  // Adjust selections on product change
  useEffect(() => {
    if (product) {
      const w = Array.from(new Set<number>(product.variants.map((v) => v.weightGrams))).sort((a: number, b: number) => a - b);
      const g = Array.from(new Set(product.variants.map((v) => v.grindType).filter((g) => g !== undefined))) as GrindType[];
      setSelectedWeight(w[0] || 0);
      setSelectedGrind(g.length > 0 ? g[0] : "");
      setQty(1);
      setActiveImg(product.images[0] || "");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Find corresponding variant matching selected size & grind
  const selectedVariant = product.variants.find(
    (v) =>
      v.weightGrams === selectedWeight &&
      (v.grindType === selectedGrind || (!v.grindType && !selectedGrind))
  ) || product.variants[0]; // fallback to first variant

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    
    addToCart({
      variantId: selectedVariant.id,
      productName: product.name,
      variantLabel: `${selectedVariant.weightLabel}${
        selectedVariant.grindType ? ` (${selectedVariant.grindType} Grind)` : ""
      }`,
      imageUrl: product.images[0],
      qty: qty,
      unitPrice: selectedVariant.priceKes,
    });

    onAddedSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto font-sans">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-espresso/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-milk w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-cream z-10 p-6 sm:p-8 animate-scale-up-center max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-espresso/70 hover:text-roast hover:bg-cream/40 rounded-full transition-colors cursor-pointer z-20"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Image Area */}
          <div className="md:col-span-5 space-y-4">
            <div className="h-72 sm:h-96 w-full rounded-xl overflow-hidden bg-[#ECE3CC] border border-cream shadow-md">
              <img src={activeImg} alt={product.name} className="w-full h-full object-cover transition-all" />
            </div>

            {/* Micro Thumbnail rows if available */}
            <div className="flex gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(img)}
                  className={`h-16 w-16 rounded-lg overflow-hidden border cursor-pointer ${
                    activeImg === img ? "border-latte ring-1 ring-latte" : "border-cream/80 hover:border-latte"
                  }`}
                >
                  <img src={img} alt="Thumbnail view" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Origin Quick Specs Panel */}
            <div className="bg-[#FAF7EF] rounded-xl p-4 border border-cream/70 space-y-2.5 text-xs">
              <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#9B8675] font-bold">Terroir Profile</h4>
              <div className="grid grid-cols-2 gap-3 font-medium">
                <div>
                  <span className="text-steam block font-normal">Origins</span>
                  <p className="text-espresso">{product.origin}</p>
                </div>
                {product.altitude && (
                  <div>
                    <span className="text-steam block font-normal">Elevation</span>
                    <p className="text-espresso">{product.altitude}</p>
                  </div>
                )}
                {product.process && (
                  <div>
                    <span className="text-steam block font-normal">Process</span>
                    <p className="text-espresso">{product.process}</p>
                  </div>
                )}
                <div>
                  <span className="text-steam block font-normal">Roast Level</span>
                  <p className="text-roast font-bold uppercase">{product.roastLevel}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Selectors */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Top Product details */}
            <div className="space-y-2">
              <div className="flex gap-2 items-center text-xs font-mono text-leaf uppercase">
                <Award className="h-4 w-4" />
                <span>Specialty Grade Micro-lot</span>
              </div>
              
              <h2 className="font-display font-black text-2xl sm:text-3.5xl text-espresso tracking-tight leading-none">
                {product.name}
              </h2>
              
              {/* Dynamic Price Display */}
              <div className="text-2xl font-mono font-black text-roast pt-1.5 flex items-baseline gap-1">
                <span>KES</span>
                <span>{selectedVariant ? selectedVariant.priceKes : "---"}</span>
                {selectedVariant && selectedVariant.stockQty < 10 && (
                  <span className="ml-3 bg-[#FCF0E6] text-amber-600 text-[10px] font-mono font-bold px-2.5 py-1 rounded border border-amber-200 uppercase tracking-widest animate-pulse">
                    Low Stock: {selectedVariant.stockQty} left
                  </span>
                )}
              </div>
            </div>

            {/* Description Accordions */}
            <div className="text-sm font-sans text-espresso/80 leading-relaxed bg-[#FAF7EF] p-4.5 rounded-xl border border-cream/40">
              {product.description}
            </div>

            {/* Tasting Notes Bullets */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-mono tracking-widest text-[#9B8675] uppercase font-bold">Premium Flavors Checked</h4>
              <div className="flex flex-wrap gap-2">
                {product.tastingNotes.map((note) => (
                  <span
                    key={note}
                    className="bg-[#EDF5EE] text-leaf px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1.5"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-leaf" />
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Grind selector (only shown if ground category supports grinders) */}
            {grinds.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#9B8675] font-bold block">
                  Select Grind Profile
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {grinds.map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGrind(g)}
                      className={`text-center py-2.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        selectedGrind === g
                          ? "bg-roast text-cream border-roast shadow"
                          : "bg-white border-cream hover:border-latte text-espresso/80"
                      }`}
                    >
                      <span className="block capitalize">{g.toLowerCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gram Weight Selectors */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#9B8675] font-bold block flex items-center gap-1">
                <Scale className="h-3.5 w-3.5" /> Bag Netweight Size
              </label>
              <div className="flex gap-3">
                {weights.map((w) => {
                  const matchVar = product.variants.find((v) => v.weightGrams === w);
                  const label = w >= 1000 ? `${w/1000}kg Bag` : `${w}g bag`;
                  return (
                    <button
                      key={w}
                      disabled={!matchVar}
                      onClick={() => setSelectedWeight(w)}
                      className={`py-2.5 px-5 rounded-lg border text-xs font-bold font-mono transition-all cursor-pointer ${
                        selectedWeight === w
                          ? "bg-roast text-cream border-roast shadow"
                          : "bg-white border-cream hover:border-latte text-espresso/80"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity select & Buy trigger buttons */}
            <div className="flex gap-4 items-center pt-4 border-t border-cream">
              {/* Quant stepper */}
              <div className="flex items-center bg-[#F3ECE0] rounded-xl px-4 py-3 border border-cream shadow-sm shrink-0">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-2 text-espresso font-bold hover:text-roast text-lg cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-base font-black text-espresso w-8 text-center">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-2 text-espresso font-bold hover:text-roast text-lg cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Push into basket button */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant}
                className="flex-1 py-4 bg-roast hover:bg-espresso disabled:bg-steam text-cream rounded-xl font-bold flex items-center justify-center gap-2.5 shadow transition-all cursor-pointer transform active:scale-[0.98]"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart · KES {selectedVariant ? selectedVariant.priceKes * qty : "---"}
              </button>
            </div>

            {/* Sourcing brewing recommendation accordion (collapsed by default) */}
            {product.brewingGuide && (
              <details className="group border border-cream rounded-xl p-4 bg-[#FCFAF6] transition-colors">
                <summary className="flex justify-between items-center text-xs font-mono font-bold uppercase tracking-wider text-espresso/80 hover:text-roast cursor-pointer list-none select-none">
                  <span className="flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-latte" /> Mugi Specialist's Brewing Guideline
                  </span>
                  <ChevronRight className="h-4 w-4 text-steam transform group-open:rotate-90 transition-transform" />
                </summary>
                <div className="text-xs text-espresso/75 leading-relaxed mt-4 pt-3 border-t border-cream/50 space-y-2">
                  <p>{product.brewingGuide}</p>
                  <p className="font-mono text-[10px] text-steam uppercase">
                    BEST DRIPPED VIA: {product.bestFor.join(" / ")}
                  </p>
                </div>
              </details>
            )}

          </div>
          
        </div>
      </div>
    </div>
  );
};
