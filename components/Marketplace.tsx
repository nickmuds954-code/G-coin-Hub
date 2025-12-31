
import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { PricePoint, BinaryTrade } from '../types';

interface MarketplaceProps {
  currentPrice: number;
  priceHistory: PricePoint[];
  tradeHistory: BinaryTrade[];
  onOpenTrade: (amount: number, type: 'higher' | 'lower', duration: number) => boolean;
}

const Marketplace: React.FC<MarketplaceProps> = ({ currentPrice, priceHistory, tradeHistory, onOpenTrade }) => {
  const [tradeAmount, setTradeAmount] = useState<string>('100');
  const [tradeTime, setTradeTime] = useState<number>(30); // seconds
  const [notification, setNotification] = useState<{ text: string, type: 'success' | 'error' | 'win' | 'loss' } | null>(null);

  const profitPercent = 90;
  
  // Stats calculation
  const stats = useMemo(() => {
    if (priceHistory.length < 2) return { change: 0 };
    const first = priceHistory[0].price;
    const change = ((currentPrice - first) / first) * 100;
    return { change };
  }, [priceHistory, currentPrice]);

  const handleTrade = (type: 'higher' | 'lower') => {
    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) return;

    const success = onOpenTrade(amount, type, tradeTime);
    if (success) {
      setNotification({ text: `Position opened: ${type.toUpperCase()}`, type: 'success' });
    } else {
      setNotification({ text: 'Insufficient Balance', type: 'error' });
    }
    setTimeout(() => setNotification(null), 2000);
  };

  // Watch for recent results to show results popups
  useEffect(() => {
    const lastTrade = tradeHistory[0];
    if (lastTrade && lastTrade.status !== 'open') {
      const now = Date.now();
      // Only show notification if it just finished (within last 2 seconds)
      if (now - (lastTrade.startTime + lastTrade.duration * 1000) < 2000) {
        setNotification({ 
          text: lastTrade.status === 'won' ? `Profit: +$${lastTrade.payout.toFixed(2)}` : 'Trade Closed Out of Money', 
          type: lastTrade.status === 'won' ? 'win' : 'loss' 
        });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  }, [tradeHistory]);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      {/* Top Bar Stats */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-4 min-w-max border-b-2 border-emerald-500">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Asset</span>
          <span className="font-bold flex items-center gap-2">G Coin <span className="bg-emerald-500/20 text-emerald-500 text-[10px] px-2 py-0.5 rounded-full">{profitPercent}%</span></span>
        </div>
        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-4 min-w-max">
          <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Price</span>
          <span className={`font-mono font-bold text-lg ${stats.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            ${currentPrice.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Terminal Chart Area */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          <div className="glass rounded-3xl p-6 h-[550px] relative border border-zinc-800/40 bg-zinc-950/20">
            {/* Notification Overlay */}
            {notification && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
                <div className={`px-8 py-4 rounded-2xl shadow-2xl font-bold border-2 ${
                  notification.type === 'win' ? 'bg-emerald-600 border-emerald-400 text-white' :
                  notification.type === 'loss' ? 'bg-rose-600 border-rose-400 text-white' :
                  notification.type === 'success' ? 'bg-zinc-800 border-amber-500 text-amber-500' :
                  'bg-rose-900 border-rose-500 text-white'
                }`}>
                  {notification.text}
                </div>
              </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceHistory}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={stats.change >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={stats.change >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 10" stroke="#27272a" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} orientation="right" tick={{fontSize: 10, fill: '#52525b'}} axisLine={false} tickLine={false} />
                <Tooltip content={() => null} />
                
                {/* Active Trade Lines */}
                {tradeHistory.filter(t => t.status === 'open').map(t => (
                  <ReferenceLine 
                    key={t.id} 
                    y={t.entryPrice} 
                    stroke={t.type === 'higher' ? '#10b981' : '#f43f5e'} 
                    strokeDasharray="3 3"
                    label={{ position: 'right', value: `${t.type === 'higher' ? 'CALL' : 'PUT'} $${t.amount}`, fill: '#71717a', fontSize: 10 }}
                  />
                ))}

                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={stats.change >= 0 ? '#10b981' : '#f43f5e'} 
                  strokeWidth={2} 
                  fill="url(#colorPrice)" 
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Trade History Bar */}
          <div className="glass rounded-2xl p-4 overflow-hidden border border-zinc-800/40">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 px-2">Recent Settlements</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 px-2 scrollbar-hide">
              {tradeHistory.map(t => (
                <div key={t.id} className={`flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-xl border ${
                  t.status === 'won' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                  t.status === 'lost' ? 'bg-rose-500/10 border-rose-500/20' : 
                  'bg-zinc-800/50 border-zinc-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${t.status === 'won' ? 'bg-emerald-500' : t.status === 'lost' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`}></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400">{t.type} order</span>
                    <span className="text-xs font-mono font-bold">${t.amount}</span>
                  </div>
                  {t.status === 'open' && (
                    <div className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      {Math.max(0, Math.ceil((t.startTime + t.duration * 1000 - Date.now()) / 1000))}s
                    </div>
                  )}
                  {t.status !== 'open' && (
                    <span className={`text-[10px] font-bold ${t.status === 'won' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.status === 'won' ? `+$${t.payout.toFixed(0)}` : '-$'+t.amount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="glass rounded-3xl p-6 border border-zinc-800/40 h-full flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">Trading Terminal</h2>
              <p className="text-[10px] text-zinc-600 font-medium">Profit payout: {profitPercent}%</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Trade Amount (USD)</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setTradeAmount(prev => Math.max(1, parseInt(prev)-50).toString())} className="bg-zinc-900 w-10 h-10 rounded-lg font-bold hover:bg-zinc-800 border border-zinc-800">-</button>
                  <input 
                    type="number" 
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-center font-bold text-lg focus:outline-none focus:border-amber-500"
                  />
                  <button onClick={() => setTradeAmount(prev => (parseInt(prev)+50).toString())} className="bg-zinc-900 w-10 h-10 rounded-lg font-bold hover:bg-zinc-800 border border-zinc-800">+</button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">Duration (Seconds)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 15, 30, 60, 120, 300].map(s => (
                    <button 
                      key={s}
                      onClick={() => setTradeTime(s)}
                      className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${tradeTime === s ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                    >
                      {s < 60 ? `${s}s` : `${s/60}m`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-zinc-800/50">
               <div className="flex justify-between items-center text-xs px-2">
                 <span className="text-zinc-500">Return</span>
                 <span className="text-emerald-500 font-bold tracking-tight">${(parseFloat(tradeAmount || '0') * 1.9).toFixed(2)}</span>
               </div>
               
               <button 
                onClick={() => handleTrade('higher')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 py-6 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
               >
                 <span className="text-2xl">▲</span>
                 <span className="font-bold uppercase tracking-widest text-sm">Higher</span>
               </button>

               <button 
                onClick={() => handleTrade('lower')}
                className="w-full bg-rose-500 hover:bg-rose-400 py-6 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-rose-500/10 active:scale-95 transition-all"
               >
                 <span className="font-bold uppercase tracking-widest text-sm">Lower</span>
                 <span className="text-2xl">▼</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
