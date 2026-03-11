// SmartStock Pro - Mock Data Service
// Simulates database operations for demonstration

import type { Stock, StockScore, SectorPerformance, MarketOverview, Portfolio, PortfolioHolding, FinancialData, PriceData } from '@/types';

// KSE-100 Companies
export const companies: Stock[] = [
  { symbol: 'MARI', name: 'Mari Petroleum', sector: 'Oil & Gas', marketCap: 520000000000 },
  { symbol: 'OGDC', name: 'Oil & Gas Dev Co', sector: 'Oil & Gas', marketCap: 680000000000 },
  { symbol: 'POL', name: 'Pakistan Oilfields', sector: 'Oil & Gas', marketCap: 185000000000 },
  { symbol: 'PPL', name: 'Pakistan Petroleum', sector: 'Oil & Gas', marketCap: 320000000000 },
  { symbol: 'LUCK', name: 'Lucky Cement', sector: 'Cement', marketCap: 245000000000 },
  { symbol: 'DGKC', name: 'D.G. Khan Cement', sector: 'Cement', marketCap: 89000000000 },
  { symbol: 'FCCL', name: 'Fauji Cement', sector: 'Cement', marketCap: 112000000000 },
  { symbol: 'PIOC', name: 'Pioneer Cement', sector: 'Cement', marketCap: 45000000000 },
  { symbol: 'ENGRO', name: 'Engro Corp', sector: 'Fertilizer', marketCap: 198000000000 },
  { symbol: 'EFERT', name: 'Engro Fertilizers', sector: 'Fertilizer', marketCap: 156000000000 },
  { symbol: 'FFC', name: 'Fauji Fertilizer', sector: 'Fertilizer', marketCap: 289000000000 },
  { symbol: 'HBL', name: 'Habib Bank', sector: 'Banking', marketCap: 234000000000 },
  { symbol: 'UBL', name: 'United Bank', sector: 'Banking', marketCap: 198000000000 },
  { symbol: 'MCB', name: 'MCB Bank', sector: 'Banking', marketCap: 167000000000 },
  { symbol: 'BAFL', name: 'Bank Alfalah', sector: 'Banking', marketCap: 89000000000 },
  { symbol: 'BAHL', name: 'Bank AL Habib', sector: 'Banking', marketCap: 124000000000 },
  { symbol: 'HUBC', name: 'Hub Power', sector: 'Power', marketCap: 145000000000 },
  { symbol: 'KAPCO', name: 'Kot Addu Power', sector: 'Power', marketCap: 67000000000 },
  { symbol: 'NCPL', name: 'Nishat Chunian Power', sector: 'Power', marketCap: 34000000000 },
  { symbol: 'SYS', name: 'Systems Limited', sector: 'Technology', marketCap: 178000000000 },
  { symbol: 'TRG', name: 'TRG Pakistan', sector: 'Technology', marketCap: 56000000000 },
  { symbol: 'NETSOL', name: 'NetSol Tech', sector: 'Technology', marketCap: 28000000000 },
  { symbol: 'PAEL', name: 'Pak Elektron', sector: 'Engineering', marketCap: 42000000000 },
  { symbol: 'AGIL', name: 'Agriauto Industries', sector: 'Auto Parts', marketCap: 18000000000 },
  { symbol: 'INDU', name: 'Indus Motor', sector: 'Automobile', marketCap: 145000000000 },
  { symbol: 'PSMC', name: 'Pak Suzuki', sector: 'Automobile', marketCap: 78000000000 },
  { symbol: 'HCAR', name: 'Honda Atlas', sector: 'Automobile', marketCap: 45000000000 },
  { symbol: 'MTL', name: 'Millat Tractors', sector: 'Automobile', marketCap: 52000000000 },
  { symbol: 'MEBL', name: 'Meezan Bank', sector: 'Banking', marketCap: 312000000000 },
  { symbol: 'NBP', name: 'National Bank', sector: 'Banking', marketCap: 156000000000 },
];

// Sector colors for heatmap
const sectorColors: Record<string, string> = {
  'Oil & Gas': '#ef4444',
  'Cement': '#f97316',
  'Fertilizer': '#22c55e',
  'Banking': '#3b82f6',
  'Power': '#06b6d4',
  'Technology': '#8b5cf6',
  'Engineering': '#ec4899',
  'Auto Parts': '#f59e0b',
  'Automobile': '#14b8a6',
};

// Generate realistic scores based on company fundamentals
function generateScore(company: Stock): StockScore {
  const baseScores: Record<string, number> = {
    'MARI': 92, 'OGDC': 88, 'POL': 85, 'PPL': 82,
    'LUCK': 87, 'DGKC': 72, 'FCCL': 78, 'PIOC': 68,
    'ENGRO': 84, 'EFERT': 81, 'FFC': 86,
    'HBL': 79, 'UBL': 83, 'MCB': 80, 'BAFL': 71, 'BAHL': 75, 'MEBL': 89, 'NBP': 73,
    'HUBC': 77, 'KAPCO': 69, 'NCPL': 65,
    'SYS': 91, 'TRG': 74, 'NETSOL': 70,
    'PAEL': 66, 'AGIL': 62,
    'INDU': 82, 'PSMC': 76, 'HCAR': 64, 'MTL': 79,
  };
  
  const baseScore = baseScores[company.symbol] || 70;
  const variation = Math.floor(Math.random() * 10) - 5;
  const totalScore = Math.min(100, Math.max(0, baseScore + variation));
  
  // Distribute score across categories
  const valueScore = Math.floor(totalScore * 0.30 * (0.8 + Math.random() * 0.4));
  const healthScore = Math.floor(totalScore * 0.30 * (0.8 + Math.random() * 0.4));
  const growthScore = Math.floor(totalScore * 0.25 * (0.8 + Math.random() * 0.4));
  const momentumScore = Math.floor(totalScore * 0.15 * (0.8 + Math.random() * 0.4));
  
  // Generate realistic metrics based on sector
  const sectorMult = {
    'Oil & Gas': { pe: 7, pb: 1.1, de: 0.4, roe: 22 },
    'Cement': { pe: 9, pb: 1.3, de: 0.5, roe: 18 },
    'Fertilizer': { pe: 8, pb: 1.2, de: 0.45, roe: 20 },
    'Banking': { pe: 6, pb: 1.0, de: 7.5, roe: 24 },
    'Power': { pe: 5, pb: 0.9, de: 1.1, roe: 15 },
    'Technology': { pe: 14, pb: 2.8, de: 0.2, roe: 28 },
    'Engineering': { pe: 7, pb: 1.0, de: 0.4, roe: 14 },
    'Auto Parts': { pe: 6, pb: 0.9, de: 0.35, roe: 16 },
    'Automobile': { pe: 10, pb: 1.4, de: 0.55, roe: 19 },
  };
  
  const mult = (sectorMult as Record<string, { pe: number; pb: number; de: number; roe: number }>)[company.sector] || { pe: 10, pb: 1.5, de: 0.5, roe: 15 };
  
  return {
    symbol: company.symbol,
    name: company.name,
    sector: company.sector,
    date: new Date().toISOString().split('T')[0],
    totalScore,
    valueScore: Math.min(30, valueScore),
    healthScore: Math.min(30, healthScore),
    growthScore: Math.min(25, growthScore),
    momentumScore: Math.min(15, momentumScore),
    closePrice: Math.floor(Math.random() * 300) + 40,
    volume: Math.floor(Math.random() * 1000000) + 200000,
    peRatio: parseFloat((mult.pe * (0.7 + Math.random() * 0.6)).toFixed(2)),
    pbRatio: parseFloat((mult.pb * (0.7 + Math.random() * 0.6)).toFixed(2)),
    debtToEquity: parseFloat((mult.de * (0.5 + Math.random() * 1.0)).toFixed(2)),
    roe: parseFloat((mult.roe * (0.7 + Math.random() * 0.6)).toFixed(2)),
    roa: parseFloat((mult.roe * 0.4 * (0.7 + Math.random() * 0.6)).toFixed(2)),
    netMargin: parseFloat((15 + Math.random() * 15).toFixed(2)),
    epsGrowth: parseFloat((-5 + Math.random() * 40).toFixed(2)),
    revenueGrowth: parseFloat((-2 + Math.random() * 30).toFixed(2)),
    dividendYield: parseFloat((2 + Math.random() * 8).toFixed(2)),
    priceVs50dma: parseFloat((-10 + Math.random() * 25).toFixed(2)),
    priceVs200dma: parseFloat((-15 + Math.random() * 40).toFixed(2)),
    rsi14: parseFloat((35 + Math.random() * 40).toFixed(2)),
    volumeVsAvg: parseFloat((-20 + Math.random() * 80).toFixed(2)),
  };
}

// Generate all stock scores
export const stockScores: StockScore[] = companies.map(generateScore);

// Get top 10 stocks by score
export function getTop10Stocks(): StockScore[] {
  return [...stockScores]
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 10);
}

// Get sector performance
export function getSectorPerformance(): SectorPerformance[] {
  const sectorMap = new Map<string, { scores: number[]; count: number }>();
  
  stockScores.forEach(stock => {
    if (!sectorMap.has(stock.sector)) {
      sectorMap.set(stock.sector, { scores: [], count: 0 });
    }
    const data = sectorMap.get(stock.sector)!;
    data.scores.push(stock.totalScore);
    data.count++;
  });
  
  return Array.from(sectorMap.entries()).map(([sector, data]) => ({
    sector,
    avgScore: parseFloat((data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)),
    stockCount: data.count,
    color: sectorColors[sector] || '#6b7280',
  })).sort((a, b) => b.avgScore - a.avgScore);
}

// Get market overview
export function getMarketOverview(): MarketOverview {
  const avgScore = stockScores.reduce((sum, s) => sum + s.totalScore, 0) / stockScores.length;
  const highScoreStocks = stockScores.filter(s => s.totalScore >= 80).length;
  const lowScoreStocks = stockScores.filter(s => s.totalScore < 40).length;
  
  let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (avgScore >= 65) sentiment = 'bullish';
  else if (avgScore < 45) sentiment = 'bearish';
  
  return {
    date: new Date().toISOString().split('T')[0],
    marketSentiment: sentiment,
    avgSmartScore: parseFloat(avgScore.toFixed(1)),
    highScoreStocks,
    lowScoreStocks,
    kse100Index: 78542.35,
    kse100Change: 1.24,
  };
}

// Get stock by symbol
export function getStockBySymbol(symbol: string): StockScore | undefined {
  return stockScores.find(s => s.symbol === symbol);
}

// Filter stocks
export function filterStocks(filters: {
  minScore?: number;
  maxScore?: number;
  minPe?: number;
  maxPe?: number;
  minDividendYield?: number;
  maxDividendYield?: number;
  sector?: string;
  minRoe?: number;
  minEpsGrowth?: number;
}): StockScore[] {
  return stockScores.filter(stock => {
    if (filters.minScore !== undefined && stock.totalScore < filters.minScore) return false;
    if (filters.maxScore !== undefined && stock.totalScore > filters.maxScore) return false;
    if (filters.minPe !== undefined && (stock.peRatio === undefined || stock.peRatio < filters.minPe)) return false;
    if (filters.maxPe !== undefined && (stock.peRatio === undefined || stock.peRatio > filters.maxPe)) return false;
    if (filters.minDividendYield !== undefined && (stock.dividendYield === undefined || stock.dividendYield < filters.minDividendYield)) return false;
    if (filters.maxDividendYield !== undefined && (stock.dividendYield === undefined || stock.dividendYield > filters.maxDividendYield)) return false;
    if (filters.sector && stock.sector !== filters.sector) return false;
    if (filters.minRoe !== undefined && (stock.roe === undefined || stock.roe < filters.minRoe)) return false;
    if (filters.minEpsGrowth !== undefined && (stock.epsGrowth === undefined || stock.epsGrowth < filters.minEpsGrowth)) return false;
    return true;
  });
}

// Get all sectors
export function getAllSectors(): string[] {
  return Array.from(new Set(companies.map(c => c.sector))).sort();
}

// Generate mock financial history
export function getFinancialHistory(symbol: string): FinancialData[] {
  const company = companies.find(c => c.symbol === symbol);
  if (!company) return [];
  
  const baseRevenue = {
    'Oil & Gas': 50000, 'Cement': 35000, 'Fertilizer': 42000,
    'Banking': 28000, 'Power': 15000, 'Technology': 8000,
    'Engineering': 12000, 'Auto Parts': 5000, 'Automobile': 65000,
  }[company.sector] || 20000;
  
  const history: FinancialData[] = [];
  const currentYear = new Date().getFullYear();
  
  for (let i = 4; i >= 0; i--) {
    const year = currentYear - i;
    const growth = 0.9 + Math.random() * 0.3;
    const revenue = Math.floor(baseRevenue * Math.pow(growth, i) * 1000000);
    const netMargin = 0.12 + Math.random() * 0.12;
    const netIncome = Math.floor(revenue * netMargin);
    
    history.push({
      year,
      revenue,
      netIncome,
      eps: parseFloat((netIncome / (500000000 + Math.random() * 300000000)).toFixed(2)),
      totalAssets: Math.floor(revenue * (2.5 + Math.random() * 1.5)),
      totalDebt: Math.floor(revenue * (0.3 + Math.random() * 0.4)),
      shareholdersEquity: Math.floor(revenue * (1.5 + Math.random() * 1.0)),
      roe: parseFloat((15 + Math.random() * 15).toFixed(2)),
      roa: parseFloat((6 + Math.random() * 8).toFixed(2)),
      netMargin: parseFloat((netMargin * 100).toFixed(2)),
      dividendsPerShare: parseFloat((2 + Math.random() * 6).toFixed(2)),
    });
  }
  
  return history.reverse();
}

// Generate mock price history
export function getPriceHistory(symbol: string, days: number = 90): PriceData[] {
  const stock = stockScores.find(s => s.symbol === symbol);
  if (!stock) return [];
  
  const history: PriceData[] = [];
  let price = stock.closePrice * 0.85;
  const endDate = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    
    const change = (Math.random() - 0.48) * 0.04;
    price = price * (1 + change);
    
    const volatility = price * 0.02;
    const open = price * (1 + (Math.random() - 0.5) * 0.01);
    const high = Math.max(open, price) + Math.random() * volatility;
    const low = Math.min(open, price) - Math.random() * volatility;
    
    history.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume: Math.floor(200000 + Math.random() * 800000),
    });
  }
  
  return history;
}

// Get score breakdown for a stock
export function getScoreBreakdown(symbol: string) {
  const stock = getStockBySymbol(symbol);
  if (!stock) return null;
  
  return [
    {
      category: 'Value & Pricing',
      score: stock.valueScore,
      maxScore: 30,
      percentage: Math.round((stock.valueScore / 30) * 100),
      metrics: [
        { name: 'P/E Ratio', value: stock.peRatio?.toFixed(2) || 'N/A', score: Math.min(8, Math.round(stock.valueScore * 0.27)), maxScore: 8 },
        { name: 'P/B Ratio', value: stock.pbRatio?.toFixed(2) || 'N/A', score: Math.min(6, Math.round(stock.valueScore * 0.20)), maxScore: 6 },
        { name: 'Dividend Yield', value: stock.dividendYield?.toFixed(2) + '%' || 'N/A', score: Math.min(5, Math.round(stock.valueScore * 0.17)), maxScore: 5 },
        { name: 'PEG Ratio', value: '0.85', score: Math.min(7, Math.round(stock.valueScore * 0.23)), maxScore: 7 },
        { name: 'EV/EBITDA', value: '5.2', score: Math.min(4, Math.round(stock.valueScore * 0.13)), maxScore: 4 },
      ],
    },
    {
      category: 'Financial Health',
      score: stock.healthScore,
      maxScore: 30,
      percentage: Math.round((stock.healthScore / 30) * 100),
      metrics: [
        { name: 'Debt/Equity', value: stock.debtToEquity?.toFixed(2) || 'N/A', score: Math.min(8, Math.round(stock.healthScore * 0.27)), maxScore: 8 },
        { name: 'Current Ratio', value: '1.45', score: Math.min(7, Math.round(stock.healthScore * 0.23)), maxScore: 7 },
        { name: 'Piotroski F-Score', value: '7', score: Math.min(8, Math.round(stock.healthScore * 0.27)), maxScore: 8 },
        { name: 'Interest Coverage', value: '8.5x', score: Math.min(4, Math.round(stock.healthScore * 0.13)), maxScore: 4 },
        { name: 'Altman Z-Score', value: '3.2', score: Math.min(3, Math.round(stock.healthScore * 0.10)), maxScore: 3 },
      ],
    },
    {
      category: 'Growth & Profitability',
      score: stock.growthScore,
      maxScore: 25,
      percentage: Math.round((stock.growthScore / 25) * 100),
      metrics: [
        { name: 'EPS Growth (YoY)', value: (stock.epsGrowth?.toFixed(1) || '0') + '%', score: Math.min(7, Math.round(stock.growthScore * 0.28)), maxScore: 7 },
        { name: 'Revenue Growth', value: (stock.revenueGrowth?.toFixed(1) || '0') + '%', score: Math.min(6, Math.round(stock.growthScore * 0.24)), maxScore: 6 },
        { name: 'ROE', value: stock.roe?.toFixed(1) + '%' || 'N/A', score: Math.min(6, Math.round(stock.growthScore * 0.24)), maxScore: 6 },
        { name: 'Net Margin', value: stock.netMargin?.toFixed(1) + '%' || 'N/A', score: Math.min(6, Math.round(stock.growthScore * 0.24)), maxScore: 6 },
      ],
    },
    {
      category: 'Momentum & Technicals',
      score: stock.momentumScore,
      maxScore: 15,
      percentage: Math.round((stock.momentumScore / 15) * 100),
      metrics: [
        { name: 'Price vs 50DMA', value: (stock.priceVs50dma?.toFixed(1) || '0') + '%', score: Math.min(4, Math.round(stock.momentumScore * 0.27)), maxScore: 4 },
        { name: 'Price vs 200DMA', value: (stock.priceVs200dma?.toFixed(1) || '0') + '%', score: Math.min(4, Math.round(stock.momentumScore * 0.27)), maxScore: 4 },
        { name: 'RSI (14)', value: stock.rsi14?.toFixed(1) || 'N/A', score: Math.min(4, Math.round(stock.momentumScore * 0.27)), maxScore: 4 },
        { name: 'Volume vs Avg', value: (stock.volumeVsAvg?.toFixed(1) || '0') + '%', score: Math.min(3, Math.round(stock.momentumScore * 0.20)), maxScore: 3 },
      ],
    },
  ];
}

// Mock portfolio data
export function getMockPortfolio(): Portfolio {
  const holdings: PortfolioHolding[] = [
    { symbol: 'MARI', name: 'Mari Petroleum', sector: 'Oil & Gas', sharesOwned: 100, avgBuyPrice: 2450, currentPrice: 2785, totalScore: 92, currentValue: 278500, investedValue: 245000, returnPct: 13.67, returnAmount: 33500 },
    { symbol: 'SYS', name: 'Systems Limited', sector: 'Technology', sharesOwned: 250, avgBuyPrice: 485, currentPrice: 625, totalScore: 91, currentValue: 156250, investedValue: 121250, returnPct: 28.87, returnAmount: 35000 },
    { symbol: 'MEBL', name: 'Meezan Bank', sector: 'Banking', sharesOwned: 150, avgBuyPrice: 185, currentPrice: 210, totalScore: 89, currentValue: 31500, investedValue: 27750, returnPct: 13.51, returnAmount: 3750 },
    { symbol: 'OGDC', name: 'Oil & Gas Dev Co', sector: 'Oil & Gas', sharesOwned: 200, avgBuyPrice: 95, currentPrice: 108, totalScore: 88, currentValue: 21600, investedValue: 19000, returnPct: 13.68, returnAmount: 2600 },
    { symbol: 'LUCK', name: 'Lucky Cement', sector: 'Cement', sharesOwned: 80, avgBuyPrice: 720, currentPrice: 785, totalScore: 87, currentValue: 62800, investedValue: 57600, returnPct: 9.03, returnAmount: 5200 },
    { symbol: 'FFC', name: 'Fauji Fertilizer', sector: 'Fertilizer', sharesOwned: 120, avgBuyPrice: 118, currentPrice: 132, totalScore: 86, currentValue: 15840, investedValue: 14160, returnPct: 11.86, returnAmount: 1680 },
    { symbol: 'DGKC', name: 'D.G. Khan Cement', sector: 'Cement', sharesOwned: 300, avgBuyPrice: 68, currentPrice: 58, totalScore: 72, currentValue: 17400, investedValue: 20400, returnPct: -14.71, returnAmount: -3000 },
  ];
  
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalInvested = holdings.reduce((sum, h) => sum + h.investedValue, 0);
  const avgScore = holdings.reduce((sum, h) => sum + h.totalScore, 0) / holdings.length;
  const riskyStocks = holdings.filter(h => h.totalScore < 50).length;
  
  return {
    id: '1',
    name: 'My Portfolio',
    holdings,
    totalValue,
    totalInvested,
    totalReturn: totalValue - totalInvested,
    avgScore: parseFloat(avgScore.toFixed(1)),
    riskyStocks,
  };
}
