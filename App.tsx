
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PricePoint, UserState, DevTreasury, TabType, BinaryTrade } from './types';
import { 
  INITIAL_GCOIN_PRICE, 
  SUB_PRICE, 
  SELL_FEE, 
  MINING_RATE, 
  ICONS 
} from './constants';
import Marketplace from './components/Marketplace';
import Wallet from './components/Wallet';
import MiningDashboard from './components/MiningDashboard';
import DevCorner from './components/DevCorner';
import Header from './components/Header';

const App: React.FC = () => {
  // --- Persistent State ---
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('g_coin_user');
    return saved ? JSON.parse(saved) : {
      usdBalance: 1000.00, // Higher starting balance for "real money" feel
      gCoinBalance: 0,
      isSubscribed: false,
      subscriptionExpiry: null,
      totalMined: 0,
      tradeHistory: []
    };
  });

  const [treasury, setTreasury] = useState<DevTreasury>(() => {
    const saved = localStorage.getItem('g_coin_treasury');
    return saved ? JSON.parse(saved) : {
      totalRevenue: 0,
      subscriptionCount: 0,
      sellFeeCount: 0,
      withdrawalHistory: []
    };
  });

  const [activeTab, setActiveTab] = useState<TabType>('market');
  const [currentPrice, setCurrentPrice] = useState(INITIAL_GCOIN_PRICE);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);

  // Market Price Simulation (More volatile for trading)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const volatility = 0.008; // Increased volatility
        const change = (Math.random() - 0.5) * prev * volatility;
        const next = Math.max(0.1, prev + change);
        setPriceHistory(history => {
          const newHistory = [...history, { time: new Date().toLocaleTimeString(), price: parseFloat(next.toFixed(2)) }];
          return newHistory.slice(-50);
        });
        return next;
      });
    }, 1000); // Faster updates for trading feel
    return () => clearInterval(interval);
  }, []);

  // Settlement Logic for Binary Options
  useEffect(() => {
    const checkTrades = setInterval(() => {
      const now = Date.now();
      let balanceChange = 0;
      let historyUpdated = false;

      const newHistory = user.tradeHistory.map(trade => {
        if (trade.status === 'open' && now >= trade.startTime + (trade.duration * 1000)) {
          historyUpdated = true;
          const isHigher = currentPrice > trade.entryPrice;
          const won = (trade.type === 'higher' && isHigher) || (trade.type === 'lower' && !isHigher);
          
          if (won) {
            balanceChange += trade.payout;
            return { ...trade, status: 'won', expiryPrice: currentPrice } as BinaryTrade;
          } else {
            return { ...trade, status: 'lost', expiryPrice: currentPrice } as BinaryTrade;
          }
        }
        return trade;
      });

      if (historyUpdated) {
        setUser(prev => ({
          ...prev,
          usdBalance: prev.usdBalance + balanceChange,
          tradeHistory: newHistory
        }));
      }
    }, 500);
    return () => clearInterval(checkTrades);
  }, [user.tradeHistory, currentPrice]);

  // Mining Simulation
  useEffect(() => {
    let miningInterval: number | undefined;
    if (user.isSubscribed) {
      miningInterval = window.setInterval(() => {
        setUser(prev => ({
          ...prev,
          gCoinBalance: prev.gCoinBalance + MINING_RATE,
          totalMined: prev.totalMined + MINING_RATE
        }));
      }, 1000);
    }
    return () => clearInterval(miningInterval);
  }, [user.isSubscribed]);

  // --- Handlers ---
  const handleOpenTrade = useCallback((amount: number, type: 'higher' | 'lower', duration: number) => {
    if (user.usdBalance >= amount) {
      const newTrade: BinaryTrade = {
        id: Math.random().toString(36).substr(2, 9),
        amount,
        entryPrice: currentPrice,
        type,
        startTime: Date.now(),
        duration,
        status: 'open',
        payout: amount * 1.90 // 90% profit
      };

      setUser(prev => ({
        ...prev,
        usdBalance: prev.usdBalance - amount,
        tradeHistory: [newTrade, ...prev.tradeHistory].slice(0, 50)
      }));
      return true;
    }
    return false;
  }, [user.usdBalance, currentPrice]);

  const handleSubscribe = useCallback(() => {
    if (user.usdBalance >= SUB_PRICE) {
      setUser(prev => ({
        ...prev,
        usdBalance: prev.usdBalance - SUB_PRICE,
        isSubscribed: true,
        subscriptionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000
      }));
      setTreasury(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + SUB_PRICE,
        subscriptionCount: prev.subscriptionCount + 1
      }));
      return true;
    }
    return false;
  }, [user.usdBalance]);

  const handleWithdraw = useCallback((amountUsd: number) => {
    const totalNeeded = amountUsd + SELL_FEE;
    if (user.usdBalance >= totalNeeded) {
      setUser(prev => ({
        ...prev,
        usdBalance: prev.usdBalance - totalNeeded
      }));
      setTreasury(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + SELL_FEE,
        sellFeeCount: prev.sellFeeCount + 1
      }));
      return true;
    }
    return false;
  }, [user.usdBalance]);

  const handleDevWithdraw = useCallback((amount: number, method: string) => {
    if (treasury.totalRevenue >= amount) {
      setTreasury(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue - amount,
        withdrawalHistory: [
          ...prev.withdrawalHistory,
          { date: new Date().toLocaleString(), amount, method }
        ]
      }));
      return true;
    }
    return false;
  }, [treasury.totalRevenue]);

  return (
    <div className="min-h-screen flex flex-col max-w-6xl mx-auto px-4 md:px-0 bg-zinc-950 pb-24 lg:pb-0 lg:pt-8">
      <Header 
        usdBalance={user.usdBalance} 
        gCoinBalance={user.gCoinBalance} 
        currentPrice={currentPrice} 
      />

      <main className="flex-1 overflow-y-auto mt-6 px-2">
        {activeTab === 'market' && (
          <Marketplace 
            currentPrice={currentPrice} 
            priceHistory={priceHistory} 
            tradeHistory={user.tradeHistory}
            onOpenTrade={handleOpenTrade}
          />
        )}
        {activeTab === 'wallet' && (
          <Wallet 
            user={user} 
            onWithdraw={handleWithdraw}
            onDeposit={(amt) => setUser(prev => ({ ...prev, usdBalance: prev.usdBalance + amt }))}
          />
        )}
        {activeTab === 'mine' && (
          <MiningDashboard 
            user={user} 
            onSubscribe={handleSubscribe} 
          />
        )}
        {activeTab === 'dev' && (
          <DevCorner 
            treasury={treasury} 
            onWithdraw={handleDevWithdraw} 
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 p-3 lg:relative lg:bg-transparent lg:border-none lg:p-6 lg:flex lg:justify-center">
        <div className="flex justify-around lg:gap-8 max-w-2xl mx-auto w-full glass rounded-2xl p-2">
          <NavItem 
            active={activeTab === 'market'} 
            onClick={() => setActiveTab('market')} 
            icon={ICONS.MARKET} 
            label="Trade" 
          />
          <NavItem 
            active={activeTab === 'wallet'} 
            onClick={() => setActiveTab('wallet')} 
            icon={ICONS.WALLET} 
            label="Assets" 
          />
          <NavItem 
            active={activeTab === 'mine'} 
            onClick={() => setActiveTab('mine')} 
            icon={ICONS.MINING} 
            label="Mining" 
          />
          <NavItem 
            active={activeTab === 'dev'} 
            onClick={() => setActiveTab('dev')} 
            icon={ICONS.DEV} 
            label="Admin" 
          />
        </div>
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ 
  active, onClick, icon, label 
}) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center transition-all px-4 py-2 rounded-xl ${active ? 'bg-amber-500/10 text-amber-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
  >
    <span className="text-xl mb-1">{icon}</span>
    <span className="text-xs font-semibold uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
