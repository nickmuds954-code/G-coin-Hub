
import React from 'react';
import { ICONS } from '../constants';

interface HeaderProps {
  usdBalance: number;
  gCoinBalance: number;
  currentPrice: number;
}

const Header: React.FC<HeaderProps> = ({ usdBalance, gCoinBalance, currentPrice }) => {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between p-6 glass rounded-3xl gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 g-gradient rounded-full flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
          G
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">G Coin <span className="text-amber-500 italic">Hub</span></h1>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Next-Gen Digital Asset</p>
        </div>
      </div>

      <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        <StatCard label="USD Balance" value={`$${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={ICONS.USD} />
        <StatCard label="G Coin Holdings" value={`${gCoinBalance.toFixed(4)} G`} icon={ICONS.G_COIN} color="text-amber-500" />
        <StatCard label="Market Price" value={`$${currentPrice.toLocaleString()}`} icon={ICONS.MARKET} color="text-emerald-500" />
      </div>
    </header>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: string; color?: string }> = ({ label, value, icon, color }) => (
  <div className="bg-zinc-900/50 border border-zinc-800 p-3 px-5 rounded-2xl min-w-[140px] flex-shrink-0">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs text-zinc-500 font-medium uppercase">{label}</span>
    </div>
    <div className={`text-lg font-bold ${color || 'text-white'} flex items-center gap-2`}>
      {value}
    </div>
  </div>
);

export default Header;
