import React, { useEffect, useState, useRef } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface PairData {
  pair: string;
  price: string;
  change: string;
  up: boolean;
}

const defaultPairs: PairData[] = [
  { pair: 'GBP/USD', price: '1.2739', change: '-0.181%', up: false },
  { pair: 'USD/JPY', price: '149.82', change: '+0.227%', up: true },
  { pair: 'XAU/USD', price: '2341.50', change: '+0.350%', up: true },
  { pair: 'USD/CHF', price: '0.9013', change: '-0.122%', up: false },
  { pair: 'AUD/USD', price: '0.6547', change: '+0.122%', up: true },
  { pair: 'EUR/USD', price: '1.0900', change: '+0.120%', up: true },
];

export function Ticker() {
  const [pairs, setPairs] = useState<PairData[]>(defaultPairs);
  const baseRatesRef = useRef<PairData[]>(defaultPairs);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data && data.rates) {
          const rates = data.rates;
          
          const newBases = [
            { ...defaultPairs[0], price: (1 / rates.GBP).toFixed(4) },
            { ...defaultPairs[1], price: (rates.JPY).toFixed(2) },
            { ...defaultPairs[2] }, // XAU often not in standard currency end points
            { ...defaultPairs[3], price: (rates.CHF).toFixed(4) },
            { ...defaultPairs[4], price: (1 / rates.AUD).toFixed(4) },
            { ...defaultPairs[5], price: (1 / rates.EUR).toFixed(4) },
          ];
          
          baseRatesRef.current = newBases;
          setPairs(newBases);
        }
      } catch (err) {
        // Fall back to default silent
      }
    };
    
    fetchRates();

    // Simulate real-time market fluctuations (the free API only updates once daily)
    const interval = setInterval(() => {
      setPairs(currentPairs => currentPairs.map((p, i) => {
        const basePrice = parseFloat(baseRatesRef.current[i].price);
        // Random fluctuation between -0.02% and +0.02%
        const fluctuation = (Math.random() - 0.5) * 0.0004; 
        const newPrice = basePrice * (1 + fluctuation);
        
        let changeVal = parseFloat(p.change);
        // Slightly update the change percentage too, tending back towards original if wandering far
        const originalChange = parseFloat(baseRatesRef.current[i].change);
        const changeDrift = (Math.random() - 0.5) * 0.05;
        // Keep change within +/- 1% of original
        if (Math.abs(changeVal - originalChange) > 1) {
          changeVal = originalChange;
        } else {
          changeVal += changeDrift;
        }
        
        return {
          ...p,
          price: p.pair === 'USD/JPY' ? newPrice.toFixed(2) : newPrice.toFixed(4),
          change: (changeVal > 0 ? '+' : '') + changeVal.toFixed(3) + '%',
          up: changeVal >= 0
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // We duplicate the array 4 times so when it translates -50%, it loops seamlessly from half to identical half.
  const tickerItems = [...pairs, ...pairs, ...pairs, ...pairs, ...pairs, ...pairs, ...pairs, ...pairs];

  return (
    <div className="w-full bg-[#0B0F19] border-y border-white/5 py-4 overflow-hidden relative flex">
      <div className="flex w-max shrink-0 animate-marquee items-center gap-12 pr-12">
        {tickerItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="font-bold text-white text-sm whitespace-nowrap">{item.pair}</span>
            <span className="text-gray-400 font-mono text-sm">{item.price}</span>
            <span className={`flex items-center gap-0.5 font-mono text-xs ${item.up ? 'text-[#00D084]' : 'text-red-500'}`}>
              {item.up ? <TrendingUp size={14} className="pb-0.5" /> : <TrendingDown size={14} className="pb-0.5" />}
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
