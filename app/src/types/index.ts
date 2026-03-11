// SmartStock Pro - Type Definitions

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  industry?: string;
  marketCap?: number;
}

export interface StockScore {
  symbol: string;
  name: string;
  sector: string;
  date: string;
  totalScore: number;
  valueScore: number;
  healthScore: number;
  growthScore: number;
  momentumScore: number;
  closePrice: number;
  volume: number;
  peRatio?: number;
  pbRatio?: number;
  debtToEquity?: number;
  roe?: number;
  roa?: number;
  netMargin?: number;
  epsGrowth?: number;
  revenueGrowth?: number;
  dividendYield?: number;
  priceVs50dma?: number;
  priceVs200dma?: number;
  rsi14?: number;
  volumeVsAvg?: number;
}

export interface SectorPerformance {
  sector: string;
  avgScore: number;
  avgPe?: number;
  avgPb?: number;
  avgDividendYield?: number;
  stockCount: number;
  color: string;
}

export interface MarketOverview {
  date: string;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  avgSmartScore: number;
  highScoreStocks: number;
  lowScoreStocks: number;
  kse100Index?: number;
  kse100Change?: number;
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  sector: string;
  sharesOwned: number;
  avgBuyPrice: number;
  currentPrice: number;
  totalScore: number;
  currentValue: number;
  investedValue: number;
  returnPct: number;
  returnAmount: number;
}

export interface Portfolio {
  id: string;
  name: string;
  holdings: PortfolioHolding[];
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  avgScore: number;
  riskyStocks: number;
}

export interface FinancialData {
  year: number;
  revenue: number;
  netIncome: number;
  eps: number;
  totalAssets: number;
  totalDebt: number;
  shareholdersEquity: number;
  roe: number;
  roa: number;
  netMargin: number;
  dividendsPerShare?: number;
}

export interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  metrics: {
    name: string;
    value: string | number;
    score: number;
    maxScore: number;
  }[];
}

export interface ScreenerFilter {
  minScore?: number;
  maxScore?: number;
  minPe?: number;
  maxPe?: number;
  minDividendYield?: number;
  maxDividendYield?: number;
  sector?: string;
  minRoe?: number;
  minEpsGrowth?: number;
}
