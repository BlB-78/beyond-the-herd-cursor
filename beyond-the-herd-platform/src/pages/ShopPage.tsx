import React from 'react';
import { ShoppingBag } from 'lucide-react';

export function ShopPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pt-24 pb-12 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-20 h-20 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-3xl font-display font-bold mb-4 text-white">Merch Store</h1>
        <p className="text-gray-400 mb-8">
          Exclusive Beyond The Herd merchandise is coming soon. Stay tuned to represent the elite trader mindset everywhere you go.
        </p>
        <button disabled className="bg-white/5 text-gray-500 border border-white/10 px-6 py-3 rounded-md font-bold cursor-not-allowed">
          Coming Soon
        </button>
      </div>
    </div>
  );
}
