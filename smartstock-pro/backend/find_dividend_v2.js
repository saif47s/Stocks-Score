import axios from 'axios';
import * as cheerio from 'cheerio';

const AXIOS_CONFIG = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://dps.psx.com.pk/',
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8'
    },
    timeout: 15000
};

async function findDividendRow(symbol) {
    const url = `https://dps.psx.com.pk/company/${symbol}`;
    console.log(`Fetching ${url}...`);
    const response = await axios.get(url, AXIOS_CONFIG);
    const $ = cheerio.load(response.data);

    // Find all table rows with "dividend" or "credit" 
    console.log('\n=== All TR rows with dividend/credit text ===');
    $('tr').each((i, el) => {
        const text = $(el).text().trim().toLowerCase();
        if (text.includes('dividend') || text.includes('credit of')) {
            console.log(`TR[${i}]: "${$(el).text().trim().substring(0, 200)}"`);
        }
    });

    // Check the PSX financials API endpoint
    console.log('\n=== Checking financials API ===');
    try {
        const finUrl = `https://dps.psx.com.pk/financials/${symbol}`;
        const finRes = await axios.get(finUrl, AXIOS_CONFIG);
        console.log('Financials API status:', finRes.status);
        if (typeof finRes.data === 'object') {
            console.log('Keys:', Object.keys(finRes.data));
        } else {
            console.log('Response (first 200):', String(finRes.data).substring(0, 200));
        }
    } catch (err) {
        console.log('Financials API error:', err.message);
    }

    // Check balance sheet / income statement links
    console.log('\n=== Checking all anchor links ===');
    $('a[href]').each((i, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim();
        if (href.includes('financial') || href.includes('dividend') || href.includes('annual') || text.toLowerCase().includes('financial')) {
            console.log(`  Link: "${text}" => ${href}`);
        }
    });
}

findDividendRow('ENGRO').catch(console.error);
