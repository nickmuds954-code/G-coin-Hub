
import React, { useState } from 'react';
import { DevTreasury } from '../types';
import { DEV_PASSWORD } from '../constants';

interface DevCornerProps {
  treasury: DevTreasury;
  onWithdraw: (amount: number, method: string) => boolean;
}

const DevCorner: React.FC<DevCornerProps> = ({ treasury, onWithdraw }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [method, setMethod] = useState('Bank Account');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DEV_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid developer access key.');
    }
  };

  const handleDevWithdraw = () => {
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) return;
    
    const success = onWithdraw(val, method);
    if (success) {
      setWithdrawAmount('');
      alert('Withdrawal processed to your account.');
    } else {
      alert('Insufficient treasury funds.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto glass rounded-3xl p-8 mt-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 text-amber-500">
            🔐
          </div>
          <h2 className="text-2xl font-bold">Developer Access</h2>
          <p className="text-zinc-500 text-sm">Protected by G Coin Core Encryption</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Admin Key..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-5 focus:outline-none focus:border-amber-500 text-center text-2xl tracking-[0.5em]"
          />
          {error && <p className="text-rose-500 text-sm text-center font-medium">{error}</p>}
          <button className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-zinc-200 transition-all">
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TreasuryCard label="Total Treasury Revenue" value={`$${treasury.totalRevenue.toFixed(2)}`} color="text-amber-500" />
        <TreasuryCard label="Subscriptions Sold" value={treasury.subscriptionCount.toString()} />
        <TreasuryCard label="Withdrawal Fees Collected" value={treasury.sellFeeCount.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">Developer Payout</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Withdrawal Method</label>
              <select 
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-5 focus:outline-none text-white font-semibold"
              >
                <option>Mobile Money</option>
                <option>Bank Account</option>
                <option>PayPal Admin</option>
                <option>Crypto Settlement</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Amount</label>
              <input 
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-5 focus:outline-none focus:border-amber-500 text-lg font-bold"
              />
            </div>

            <button 
              onClick={handleDevWithdraw}
              className="w-full g-gradient text-black py-4 rounded-xl font-bold shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
            >
              Transfer to Admin Account
            </button>
          </div>
        </div>

        <div className="glass rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-6">Withdrawal History</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {treasury.withdrawalHistory.length === 0 ? (
              <p className="text-zinc-600 italic">No historical payouts found.</p>
            ) : (
              treasury.withdrawalHistory.map((item, idx) => (
                <div key={idx} className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                  <div>
                    <p className="text-white font-bold">${item.amount.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500">{item.date}</p>
                  </div>
                  <span className="text-xs font-bold bg-zinc-800 px-3 py-1 rounded-full text-zinc-400">
                    {item.method}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TreasuryCard: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="glass rounded-3xl p-6 border-l-4 border-amber-500">
    <p className="text-xs font-bold text-zinc-500 uppercase mb-1">{label}</p>
    <p className={`text-3xl font-extrabold ${color || 'text-white'}`}>{value}</p>
  </div>
);

export default DevCorner;
