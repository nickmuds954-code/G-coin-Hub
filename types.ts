
export interface PricePoint {
  time: string;
  price: number;
}

export interface BinaryTrade {
  id: string;
  amount: number;
  entryPrice: number;
  expiryPrice?: number;
  type: 'higher' | 'lower';
  startTime: number;
  duration: number; // in seconds
  status: 'open' | 'won' | 'lost';
  payout: number;
}

export interface UserState {
  usdBalance: number;
  gCoinBalance: number;
  isSubscribed: boolean;
  subscriptionExpiry: number | null;
  totalMined: number;
  tradeHistory: BinaryTrade[];
}

export interface DevTreasury {
  totalRevenue: number;
  subscriptionCount: number;
  sellFeeCount: number;
  withdrawalHistory: { date: string; amount: number; method: string }[];
}

export type TabType = 'market' | 'wallet' | 'mine' | 'dev';
