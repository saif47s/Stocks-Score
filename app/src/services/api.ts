// SmartStock Pro API Service
// Real-Time PSX Data with Auto-Update via Backend
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api';

// Types
export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  closePrice: number;
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  volume?: number;
  change?: number;
  changePercent?: number;
  marketCap: number;
  peRatio?: number;
  pbRatio?: number;
  dividendYield?: number;
  roe?: number;
  debtToEquity?: number;
  epsGrowth?: number;
  rsi14?: number;
  priceVs50dma?: number;
  priceVs200dma?: number;
  zScore?: {
    score: number;
    zone: 'Safe' | 'Grey' | 'Distress';
    risk: 'High' | 'Low';
  };
  fScore?: {
    score: number;
    rating: 'Bulletproof' | 'Steady' | 'Weak';
  };
  lastUpdated?: string;
  assetType?: 'Stock' | 'ETF' | 'Mutual Fund';
  isSuspicious?: boolean;
  totalScore: number;
  valueScore: number;
  healthScore: number;
  growthScore: number;
  momentumScore: number;
  roic?: number;
  evEbitda?: number;
  masterSignal?: {
    signal: 'STRONG BUY' | 'ACCUMULATE' | 'HOLD';
    strength: number;
    description: string;
  };
}

export interface MarketOverview {
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  avgSmartScore: number;
  highScoreStocks: number;
  lowScoreStocks: number;
  totalStocks: number;
  kse100Index: number;
  kse100Change: number;
  lastUpdated: string;
  nextUpdateIn: string;
}

export interface SectorPerformance {
  sector: string;
  avgScore: number;
  stockCount: number;
  totalMarketCap?: number;
}

export interface PriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
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
  dividendsPerShare: number;
}

export interface ScreenerFilters {
  minScore?: number;
  maxScore?: number;
  minPe?: number;
  maxPe?: number;
  minDividendYield?: number;
  maxDividendYield?: number;
  sector?: string;
  minRoe?: number;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API Client - Connects to Real-Time Backend
class ApiClient {
  // Health check
  async healthCheck() {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  }

  // Get all stocks with filtering
  async getStocks(filters?: ScreenerFilters): Promise<{ success: boolean; count: number; data: Stock[] }> {
    const response = await axios.get(`${API_BASE_URL}/stocks`);
    let result = response.data.data;

    if (filters) {
      if (filters.minScore !== undefined) {
        result = result.filter(s => s.totalScore >= filters.minScore!);
      }
      if (filters.maxScore !== undefined) {
        result = result.filter(s => s.totalScore <= filters.maxScore!);
      }
      if (filters.sector) {
        result = result.filter(s => s.sector === filters.sector);
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        result = result.filter(s =>
          s.symbol.toLowerCase().includes(query) ||
          s.name.toLowerCase().includes(query)
        );
      }

      // Sort
      if (filters.sortBy) {
        const sortKey = filters.sortBy;
        result.sort((a, b) => {
          const aVal = a[sortKey] || 0;
          const bVal = b[sortKey] || 0;
          return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });
      }
    }

    return { success: true, count: result.length, data: result };
  }

  // Get top stocks
  async getTopStocks(limit: number = 10): Promise<{ success: boolean; count: number; data: Stock[] }> {
    const response = await axios.get(`${API_BASE_URL}/stocks`);
    const stocks = response.data.data
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
    return { success: true, count: stocks.length, data: stocks };
  }

  // Get single stock
  async getStock(symbol: string): Promise<{ success: boolean; data: Stock }> {
    const response = await axios.get(`${API_BASE_URL}/stocks/${symbol}`);
    return response.data;
  }

  // Get stock price history (Mocked for now as PSX history requires separate scraping)
  async getStockHistory(symbol: string, days: number = 90): Promise<{ success: boolean; symbol: string; count: number; data: PriceHistory[] }> {
    return { success: true, symbol, count: 0, data: [] };
  }

  // Get stock financials (Mocked for now)
  async getStockFinancials(symbol: string): Promise<{ success: boolean; symbol: string; data: FinancialData[] }> {
    return { success: true, symbol, data: [] };
  }

  // Get all sectors
  async getSectors(): Promise<{ success: boolean; count: number; data: string[] }> {
    const response = await axios.get(`${API_BASE_URL}/sectors`);
    const sectors = response.data.data.map(s => s.sector);
    return { success: true, count: sectors.length, data: sectors };
  }

  // Get sector performance
  async getSectorPerformance(): Promise<{ success: boolean; count: number; data: SectorPerformance[] }> {
    const response = await axios.get(`${API_BASE_URL}/sectors`);
    return response.data;
  }

  // Get market overview
  async getMarketOverview(): Promise<{ success: boolean; data: MarketOverview }> {
    const response = await axios.get(`${API_BASE_URL}/overview`);
    return response.data;
  }

  // Custom Weighted Scan (Phase 4)
  async scanStocks(weights: { value: number; health: number; growth: number; momentum: number }): Promise<{ success: boolean; count: number; data: Stock[] }> {
    const response = await axios.post(`${API_BASE_URL}/scan`, { weights });
    return response.data;
  }
}

export const api = new ApiClient();

// Hook for using API with loading and error states
import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetchData();
  }, deps);

  return { data, loading, error, refetch: fetchData };
}
