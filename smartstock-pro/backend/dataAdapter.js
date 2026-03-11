/**
 * PSX Data Adapter
 * Handles data extraction from PSX Data Portal with fallback logic.
 * isolates the "fragile" scraping part from the main logic.
 */
import axios from 'axios';
import * as cheerio from 'cheerio'; // Need to install this

const AXIOS_CONFIG = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dps.psx.com.pk/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    },
    timeout: 15000
};

// CSS Selectors - Isolated for easy maintenance
const SELECTORS = {
    quote: {
        pe: '.pe-ratio-value', // Hypothetical, will refine
        eps: '.eps-value',
        marketCap: '.market-cap-value'
    },
    financials: {
        table: '.financials-table',
        rows: 'tr'
    }
};

export class PSXDataAdapter {
    /**
     * Fetch all symbols with names and sector names (JSON)
     */
    static async getSymbolsMetadata() {
        try {
            const url = 'https://dps.psx.com.pk/symbols';
            const response = await axios.get(url, AXIOS_CONFIG);
            return response.data || [];
        } catch (error) {
            console.error(`Adapter Error [Symbols]:`, error.message);
            return [];
        }
    }

    /**
     * Fetch real-time market data from the HTML table (Scraping)
     */
    static async getMarketWatchData() {
        try {
            const url = 'https://dps.psx.com.pk/market-watch';
            const response = await axios.get(url, AXIOS_CONFIG);
            const $ = cheerio.load(response.data);
            const stocks = [];

            $('tr').each((i, el) => {
                const tds = $(el).find('td');
                if (tds.length >= 11) {
                    const symbol = tds.eq(0).attr('data-search') || tds.eq(0).text().trim();
                    if (symbol) {
                        stocks.push({
                            symbol,
                            price: this.parseNumber(tds.eq(7).attr('data-order') || tds.eq(7).text()),
                            change: this.parseNumber(tds.eq(8).attr('data-order') || tds.eq(8).text()),
                            volume: this.parseNumber(tds.eq(10).attr('data-order') || tds.eq(10).text()),
                            sector: tds.eq(1).text().trim() // Extract sector directly from column 2
                        });
                    }
                }
            });

            return stocks;
        } catch (error) {
            console.error(`Adapter Error [MarketWatch]:`, error.message);
            return [];
        }
    }

    /**
     * Fetch advanced metrics for a specific symbol
     */
    static async getCompanyFundamentals(symbol) {
        try {
            const url = `https://dps.psx.com.pk/company/${symbol}`;
            const response = await axios.get(url, AXIOS_CONFIG);
            const $ = cheerio.load(response.data);

            const getStat = (label) => {
                let foundVal = 0;
                $('.stats_item').each((i, el) => {
                    const txt = $(el).find('.stats_label').text().trim().toLowerCase();
                    if (txt.includes(label.toLowerCase())) {
                        const val = $(el).find('.stats_value').text().trim();
                        foundVal = this.parseNumber(val);
                        return false; // break
                    }
                });
                return foundVal;
            };

            const peRatio = getStat('P/E Ratio');
            const eps = getStat('EPS');
            const marketCapLabel = getStat('Market Cap'); // This might be in different formats
            const marketCap = marketCapLabel || getStat('Market Capitalization') || 0;
            const closePrice = this.parseNumber($('.quote__close').text()) || getStat('LDCP') || 1;

            let pbRatio = getStat('Price to BV') || getStat('P/BV');
            let roe = 0;

            // Derived ROE or P/B if missing
            if (peRatio > 0 && pbRatio > 0) {
                roe = (pbRatio / peRatio) * 100;
            }

            // Dividend Extraction - look for Rs. X.XX or @ Rs X.XX or Credit of Rs X.XX
            let dividendPerShare = 0;
            $('tr').each((i, el) => {
                const text = $(el).text().trim().replace(/\s+/g, ' ');
                const lpTxt = text.toLowerCase();
                
                if (lpTxt.includes('cash dividend') || lpTxt.includes('credit of rs') || lpTxt.includes('payout')) {
                    // Look for numbers preceded by Rs. or @ Rs
                    const match = text.match(/(?:Rs\.?\s*|@\s*Rs\.?\s*)([\d.]+)/i);
                    if (match) {
                        const val = parseFloat(match[1]);
                        if (val > 0 && val < 500 && val > dividendPerShare) {
                            dividendPerShare = val;
                        }
                    }
                }
            });

            const dividendYield = closePrice > 0 ? (dividendPerShare / closePrice) * 100 : 0;

            return {
                symbol,
                peRatio,
                pbRatio,
                dividendYield: Math.round(dividendYield * 100) / 100,
                eps,
                marketCap,
                roe: Math.round(roe * 100) / 100,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Adapter Error [Fundamentals] for ${symbol}:`, error.message);
            return null;
        }
    }

    /**
     * Fetch Market Indices (KSE100, etc)
     */
    static async getMarketIndices() {
        try {
            const url = 'https://dps.psx.com.pk/indices';
            const response = await axios.get(url, AXIOS_CONFIG);
            const $ = cheerio.load(response.data);
            const indices = [];

            // Primary source: Index Detail Table
            $('table tr').each((i, el) => {
                const tds = $(el).find('td');
                if (tds.length >= 4) {
                    // Column 0: Index Name (e.g., "KSE 100")
                    let name = tds.eq(0).text().trim().toUpperCase().replace(/\s+/g, '');
                    const val = this.parseNumber(tds.eq(1).text());
                    const change = this.parseNumber(tds.eq(2).text());
                    const changep = this.parseNumber(tds.eq(3).text());

                    // Normalize name
                    if (name.includes('KSE100')) name = 'KSE100';
                    if (name.includes('KSE30')) name = 'KSE30';
                    if (name.includes('KMI30')) name = 'KMI30';
                    if (name.includes('ALLSHR')) name = 'ALLSHR';

                    if (name) {
                        indices.push({
                            symbol: name,
                            name: name,
                            price: val,
                            change: change,
                            changePercent: changep,
                            lastUpdated: new Date().toISOString()
                        });
                    }
                }
            });

            // Fallback: topIndices items if table fails
            if (indices.length === 0) {
                $('.topIndices__item').each((i, el) => {
                    const name = $(el).find('.topIndices__item__name').text().trim();
                    const val = this.parseNumber($(el).find('.topIndices__item__val').text());
                    if (name) {
                        indices.push({ symbol: name, price: val });
                    }
                });
            }

            return indices;
        } catch (error) {
            console.error(`Adapter Error [Indices]:`, error.message);
            return [];
        }
    }

    /**
     * Helper to clean and parse numbers
     */
    static parseNumber(val) {
        if (!val) return 0;
        // Clean currency, commas, and percentage signs, keeping the decimal
        const clean = val.replace(/[^\d.-]/g, "");
        return parseFloat(clean) || 0;
    }
}
