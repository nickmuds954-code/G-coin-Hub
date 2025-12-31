
import React, { useState } from 'react';
import { UserState } from '../types';
import { SUB_PRICE, MINING_RATE } from '../constants';

interface MiningProps {
  user: UserState;
  onSubscribe: () => boolean;
}

const MiningDashboard: React.FC<MiningProps> = ({ user, onSubscribe }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const success = onSubscribe();
      if (success) {
        setShowPayModal(false);
      } else {
        alert("Insufficient USD balance to subscribe.");
      }
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">⛏️</div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Cloud Mining Center</h2>
          <p className="text-zinc-400 mb-8">Harness G Coin power directly from the cloud.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
              <p className="text-zinc-500 text-sm font-medium uppercase mb-1">Status</p>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${user.isSubscribed ? 'bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50' : 'bg-zinc-600'}`}></div>
                <span className={`text-xl font-bold ${user.isSubscribed ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {user.isSubscribed ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
              <p className="text-zinc-500 text-sm font-medium uppercase mb-1">Total Mined</p>
              <div className="text-2xl font-bold text-amber-500">
                {user.totalMined.toFixed(6)} G
              </div>
            </div>
          </div>

          {!user.isSubscribed ? (
            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-amber-500 mb-2">Start Mining Today</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Get high-hashrate cloud access for just <span className="text-white font-bold">${SUB_PRICE}/month</span>. 
                Auto-payouts every second to your wallet.
              </p>
              <button 
                onClick={() => setShowPayModal(true)}
                className="w-full g-gradient text-black py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-xl shadow-amber-500/10"
              >
                Unlock Unlimited Mining
              </button>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
              <p className="text-emerald-400 font-medium">
                Mining rate: <span className="font-bold">{(MINING_RATE * 60).toFixed(3)} G/minute</span>
              </p>
              <p className="text-zinc-500 text-xs mt-2">Subscription auto-renews soon. Keep balance to maintain uptime.</p>
            </div>
          )}
        </div>
      </div>

      {showPayModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 w-full max-w-md border border-zinc-800 rounded-3xl p-8 animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold mb-6 text-center">Checkout</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center bg-zinc-800/50 p-4 rounded-xl">
                <span className="text-zinc-400">G Mining Monthly Sub</span>
                <span className="font-bold">${SUB_PRICE.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <PaymentMethod icon="💳" label="Bank Card / Credit Card" />
                <PaymentMethod icon="🅿️" label="PayPal Checkout" />
                <PaymentMethod icon="📱" label="Mobile Money / Crypto" />
              </div>
            </div>

            <button 
              onClick={handlePay}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl font-bold transition-all ${isProcessing ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200'}`}
            >
              {isProcessing ? 'Processing Secure Payment...' : 'Confirm Payment'}
            </button>
            <button 
              onClick={() => setShowPayModal(false)}
              className="w-full mt-3 text-zinc-500 text-sm hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentMethod: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-zinc-600 transition-colors cursor-pointer group">
    <span className="text-xl">{icon}</span>
    <span className="text-sm font-medium text-zinc-400 group-hover:text-white">{label}</span>
    <div className="ml-auto w-4 h-4 border-2 border-zinc-800 rounded-full"></div>
  </div>
);

export default MiningDashboard;
