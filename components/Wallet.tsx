
import React, { useState } from 'react';
import { UserState } from '../types';
import { SELL_FEE } from '../constants';

interface WalletProps {
  user: UserState;
  onWithdraw: (amount: number) => boolean;
  onDeposit: (amount: number) => void;
}

const Wallet: React.FC<WalletProps> = ({ user, onWithdraw, onDeposit }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleWithdrawClick = () => {
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      const success = onWithdraw(val);
      if (success) {
        setMessage({ text: 'Withdrawal initiated successfully!', type: 'success' });
        setWithdrawAmount('');
      } else {
        setMessage({ text: 'Insufficient USD balance for withdrawal and fee ($1.00)', type: 'error' });
      }
      setIsProcessing(false);
      setTimeout(() => setMessage(null), 3000);
    }, 1500);
  };

  const handleDepositClick = () => {
    onDeposit(50);
    setMessage({ text: 'Demo Deposit: +$50.00 Added!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass rounded-3xl p-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-4xl mb-6 text-emerald-500">
          💰
        </div>
        <h2 className="text-2xl font-bold mb-1">Total Asset Value</h2>
        <p className="text-zinc-500 text-sm mb-6">Combined USD and G Coin Holdings</p>
        
        <div className="text-4xl font-extrabold tracking-tight mb-8">
          ${user.usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>

        <div className="w-full space-y-3">
          <button 
            onClick={handleDepositClick}
            className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 py-4 rounded-2xl font-bold transition-all"
          >
            Deposit Funds
          </button>
        </div>
      </div>

      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6">Withdraw Funds</h2>
        
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs text-amber-500 mb-4 font-medium">
            Note: A fixed fee of <span className="font-bold underline">${SELL_FEE.toFixed(2)}</span> applies to all withdrawals to cover network processing costs.
          </div>

          <div className="relative">
            <input 
              type="number" 
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Withdraw amount..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 px-5 text-lg font-semibold focus:outline-none focus:border-amber-500/50 transition-all text-white"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">USD</div>
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Withdraw Amount</span>
              <span className="text-white font-bold">${parseFloat(withdrawAmount || '0').toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-zinc-800 pt-2">
              <span className="text-zinc-500">Withdrawal Fee</span>
              <span className="text-rose-500 font-bold">${SELL_FEE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-zinc-800 pt-2">
              <span className="text-zinc-400">Total Deducted</span>
              <span className="text-white">${(parseFloat(withdrawAmount || '0') + SELL_FEE).toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleWithdrawClick}
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl font-bold transition-all shadow-xl ${isProcessing ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black hover:bg-zinc-200'}`}
          >
            {isProcessing ? 'Processing Withdrawal...' : 'Request Payout'}
          </button>

          {message && (
            <div className={`mt-4 p-4 rounded-xl text-center text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
