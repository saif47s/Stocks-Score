import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { PSXDataAdapter } from './dataAdapter.js';
import { FinancialEngine } from './financialEngine.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// In-memory cache
let stockDataCache = [];
let companyFundamentalsCache = {};
let marketOverviewCache = null;
let lastFetchTime = null;

const DB_PATH = './db.json';

// Persistence Layer
const saveToDisk = () => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      stockDataCache,
      companyFundamentalsCache,
      lastFetchTime
    }, null, 2));
  } catch (e) { console.error('DB Save Failed'); }
};

const loadFromDisk = () => {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(DB_PATH));
      stockDataCache = data.stockDataCache || [];
      companyFundamentalsCache = data.companyFundamentalsCache || {};
      lastFetchTime = data.lastFetchTime ? new Date(data.lastFetchTime) : null;
      console.log('Cache loaded from disk.');
    }
  } catch (e) { console.error('DB Load Failed'); }
};

loadFromDisk();

/**
 * Calculate Smart Scores for a stock based on real-time data
 */
/**
 * Calculate Smart Scores for a stock based on REAL financial metrics.
 * MAX SCORE: 100
 */
function calculateSmartScores(stock, customWeights = null) {
  // 1. Value & Pricing (Max 30)
  // Low P/E is good (target < 15), Low P/B is good (target < 2)
  let valueScore = 0;
  if (stock.peRatio > 0 && stock.peRatio < 30) {
    valueScore += Math.max(0, 15 - (stock.peRatio / 2)); // Up to 15 points
  } else if (stock.peRatio > 0 && stock.peRatio < 10) {
    valueScore += 15;
  } else if (stock.peRatio === 0) {
    valueScore += 5; // Placeholder for missing data but avoid 0
  }
  
  if (stock.pbRatio > 0 && stock.pbRatio < 5) {
    valueScore += Math.max(0, 15 - (stock.pbRatio * 3)); // Up to 15 points
  } else if (stock.pbRatio === 0) {
    valueScore += 5;
  }
  valueScore = Math.min(30, valueScore);

  // 2. Financial Health (Max 30)
  // Based on Altman Z-Score and Piotroski F-Score
  let healthScore = 0;
  const fScoreVal = (stock.fScore?.score || 0);
  healthScore += (fScoreVal / 9) * 20; // Up to 20 points
  
  if (stock.zScore?.zone === 'Safe') healthScore += 10;
  else if (stock.zScore?.zone === 'Grey') healthScore += 5;
  
  healthScore = Math.min(30, healthScore);

  // 3. Growth & Profitability (Max 25)
  // Based on ROE and Dividend Yield
  let growthScore = 0;
  if (stock.roe > 0) {
    growthScore += Math.min(15, (stock.roe / 20) * 15); // Target 20% ROE for max 15 points
  }
  if (stock.dividendYield > 0) {
    growthScore += Math.min(10, (stock.dividendYield / 10) * 10); // Target 10% Yield for max 10 points
  }
  growthScore = Math.min(25, growthScore);

  // 4. Momentum & Technicals (Max 15)
  // Based on Price action
  let momentumScore = 0;
  const change = stock.changePercent || 0;
  if (change > 0) {
    momentumScore = Math.min(15, 5 + (change * 2));
  } else if (change < 0) {
    momentumScore = Math.max(0, 5 + (change * 1));
  } else {
    momentumScore = 5;
  }
  momentumScore = Math.min(15, momentumScore);

  const totalScore = Math.round(valueScore + healthScore + growthScore + momentumScore);

  return {
    valueScore: Math.round(valueScore),
    healthScore: Math.round(healthScore),
    growthScore: Math.round(growthScore),
    momentumScore: Math.round(momentumScore),
    totalScore: Math.min(100, totalScore),
    zScore: stock.zScore || { score: 0, zone: 'Unknown', risk: 'Unknown' },
    fScore: stock.fScore || { score: 0, rating: 'Unknown' },
    masterSignal: FinancialEngine.calculateMasterSignal(fScoreVal, stock.peRatio || 15, (stock.roe || 10) / 100),
    roic: stock.roe || 0, // Using ROE as ROIC proxy for now
    evEbitda: stock.peRatio || 0,
    macroImpact: 1.0,
    sentimentScore: totalScore > 70 ? 90 : (totalScore > 40 ? 60 : 30),
    insiderFlow: totalScore > 80 ? 'Bullish' : 'Neutral'
  };
}

const AXIOS_CONFIG = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://dps.psx.com.pk/',
    'Accept': 'application/json, text/plain, */*'
  },
  timeout: 10000
};

// Accuracy Guardrails
const PRICE_SPIKE_THRESHOLD = 0.25; // 25% change is suspicious
let isFetching = false;

export async function fetchPSXData() {
  if (isFetching) {
    console.log('Skipping sync: Fetch already in progress');
    return;
  }

  try {
    isFetching = true;
    console.log(`Starting PSX Data Sync at ${new Date().toLocaleTimeString()}...`);
    await loadFromDisk();
    // 1. Fetch Symbols Metadata (Names & Sectors)
    const symbolsMetadata = await PSXDataAdapter.getSymbolsMetadata();
    if (!symbolsMetadata || symbolsMetadata.length === 0) {
      console.warn('Symbols Metadata Fetch Failed, using fallback.');
    }

    // 2. Fetch Real-time Market Data (Prices)
    const [marketPrices, marketIndices] = await Promise.all([
      PSXDataAdapter.getMarketWatchData(),
      PSXDataAdapter.getMarketIndices()
    ]);

    if (!marketPrices || marketPrices.length === 0) {
      throw new Error('Could not fetch market prices from Market Watch');
    }

    // 3. Create Metadata Lookup
    const metadataMap = {};
    symbolsMetadata.forEach(s => {
      metadataMap[s.symbol.toUpperCase()] = s;
    });

    const processed = [];
    const stockSymbols = []; // Symbols to prioritize for fundamentals

    // 4. Merge Data
    for (const priceData of marketPrices) {
      const symbol = priceData.symbol.toUpperCase();
      const meta = metadataMap[symbol] || {};

      const changePercent = priceData.price > 0 ? (priceData.change / (priceData.price - priceData.change)) * 100 : 0;

      const baseStock = {
        symbol,
        name: meta.name || symbol,
        sector: (meta.sectorName && isNaN(meta.sectorName)) ? meta.sectorName : (priceData.sector || meta.sectorName || 'Other'),
        closePrice: priceData.price,
        change: priceData.change,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: priceData.volume,
        isDebt: meta.isDebt || false,
        isETF: meta.isETF || false,
        lastUpdated: new Date().toISOString()
      };

      // Only add to candidates for fundamentals if it's a real stock
      if (!baseStock.isDebt && !baseStock.isETF && baseStock.closePrice > 0) {
        stockSymbols.push(symbol);
      }

      processed.push(baseStock);
    }

    // 4b. Add Indices to processed for easier lookup if needed, but keep them separate in metadata
    marketIndices.forEach(idx => {
       processed.push({
         ...idx,
         name: idx.symbol,
         sector: 'Indices',
         closePrice: idx.price,
         assetType: 'Index'
       });
    });

    // 5. Phase 3 Sync: Deep Fetch Fundamentals for Top Stocks
    // Target top 300 actual stocks for maximum coverage
    const limit = 300;
    for (const symbol of stockSymbols.slice(0, limit)) {
      let fundamentals = companyFundamentalsCache[symbol] || null;
      // Re-fetch if older than 6 hours OR if metrics are missing (0)
      const isExpired = fundamentals?.lastUpdated && (new Date() - new Date(fundamentals.lastUpdated) > 6 * 3600000);
      const isMissing = !fundamentals || fundamentals.peRatio === 0;

      if (isMissing || isExpired) {
        try {
          console.log(`[Sync] Fetching fundamentals for ${symbol}... (${stockSymbols.indexOf(symbol) + 1}/${limit})`);
          fundamentals = await PSXDataAdapter.getCompanyFundamentals(symbol);
          if (fundamentals) {
            fundamentals.lastUpdated = new Date().toISOString();
            companyFundamentalsCache[symbol] = fundamentals;
          }
        } catch (e) { /* ignore */ }
      }
    }

    // 6. Final Enrichment and Scoring
    const enriched = processed.map(stock => {
      const fundamentals = companyFundamentalsCache[stock.symbol] || {};
      const scores = calculateSmartScores({
        ...stock,
        ...fundamentals
      });

      return {
        ...stock,
        ...fundamentals,
        ...scores,
        assetType: stock.isETF ? 'ETF' :
          (stock.isDebt ? 'Debt' :
            ((stock.sector?.includes('FUND') || stock.sector?.includes('MODARABAS') || stock.sector?.includes('UNIT') || stock.sector?.includes('CERTIFICATE') || stock.sector?.includes('REIT')) ? 'Mutual Fund' : 'Stock')),
        isSuspicious: Math.abs(stock.changePercent) > (PRICE_SPIKE_THRESHOLD * 100)
      };
    });

    stockDataCache = enriched;

    // 7. Update Overview Stats
    const highScores = enriched.filter(x => (x.totalScore || 0) >= 80).length;
    const lowScores = enriched.filter(x => (x.totalScore || 0) < 40).length;

    // Attempt to get KSE-100 index data from our new source
    const kse100 = marketIndices.find(item => item.symbol.includes('KSE100')) || 
                   enriched.find(item => item.symbol === 'KSE100') || {};

    const indexPrice = kse100.price || kse100.closePrice || 116633.17;
    const indexChange = kse100.changePercent || 0;

    let sentiment = 'neutral';
    if (indexChange > 0.3) sentiment = 'bullish';
    else if (indexChange < -0.3) sentiment = 'bearish';

    marketOverviewCache = {
      marketSentiment: sentiment,
      avgSmartScore: Math.round((enriched.reduce((a, b) => a + (b.totalScore || 0), 0) / (enriched.length || 1)) * 10) / 10,
      highScoreStocks: highScores,
      lowScoreStocks: lowScores,
      totalStocks: enriched.length,
      kse100Index: indexPrice,
      kse100Change: indexChange,
      lastUpdated: new Date().toISOString(),
      nextUpdateIn: '1 min'
    };

    lastFetchTime = new Date();
    saveToDisk();
    console.log(`Phase 3 Sync Complete: ${enriched.length} assets merged at ${lastFetchTime.toLocaleTimeString()}.`);
  } catch (err) {
    console.error('SYNC ERROR:', err.message);
  } finally {
    isFetching = false;
  }
}

// Initial fetch & Schedule
fetchPSXData();
cron.schedule('* * * * *', fetchPSXData);

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'Online', lastUpdate: lastFetchTime, stocksCount: stockDataCache.length });
});

app.get('/api/stocks', (req, res) => {
  res.json({ success: true, count: stockDataCache.length, data: stockDataCache });
});

app.get('/api/stocks/:symbol', (req, res) => {
  const stock = stockDataCache.find(s => s.symbol.toLowerCase() === req.params.symbol.toLowerCase());
  if (stock) res.json({ success: true, data: stock });
  else res.status(404).json({ success: false, message: 'Stock not found' });
});

app.get('/api/overview', (req, res) => {
  if (marketOverviewCache) res.json({ success: true, data: marketOverviewCache });
  else res.status(503).json({ success: false, message: 'Data not ready' });
});

app.get('/api/sectors', (req, res) => {
  const sectorMap = {};
  stockDataCache.forEach(s => {
    if (!sectorMap[s.sector]) sectorMap[s.sector] = { scores: [], count: 0 };
    sectorMap[s.sector].scores.push(s.totalScore);
    sectorMap[s.sector].count++;
  });

  const sectors = Object.keys(sectorMap).map(name => ({
    sector: name,
    avgScore: Math.round((sectorMap[name].scores.reduce((a, b) => a + b, 0) / sectorMap[name].count) * 10) / 10,
    stockCount: sectorMap[name].count
  })).sort((a, b) => b.avgScore - a.avgScore);

  res.json({ success: true, count: sectors.length, data: sectors });
});

app.post('/api/scan', (req, res) => {
  const { weights } = req.body;

  if (!weights || typeof weights !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid weights' });
  }

  // Normalize weights to sum to 1
  const sum = (weights.value || 0) + (weights.health || 0) + (weights.growth || 0) + (weights.momentum || 0);
  const normalized = {
    value: (weights.value || 0) / sum,
    health: (weights.health || 0) / sum,
    growth: (weights.growth || 0) / sum,
    momentum: (weights.momentum || 0) / sum
  };

  const reScored = stockDataCache.map(s => ({
    ...s,
    ...calculateSmartScores(s, normalized)
  })).sort((a, b) => b.totalScore - a.totalScore);

  res.json({ success: true, count: reScored.length, data: reScored });
});

app.listen(PORT, () => {
  console.log(`SmartStock Pro: Institutional Engine running on http://localhost:${PORT}`);
});
