import axios from 'axios';
import * as cheerio from 'cheerio';

const AXIOS_CONFIG = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dps.psx.com.pk/',
        'Accept': 'application/json, text/html, */*',
        'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: 15000
};

async function testEndpoints(symbol) {
    const endpoints = [
        `https://dps.psx.com.pk/dividends/${symbol}`,
        `https://dps.psx.com.pk/api/dividends?symbol=${symbol}`,
        `https://dps.psx.com.pk/company/${symbol}/dividends`,
        `https://dps.psx.com.pk/corporate-action/${symbol}`,
        `https://dps.psx.com.pk/quotations?symbol=${symbol}&type=dividend`,
    ];

    for (const url of endpoints) {
        try {
            const r = await axios.get(url, AXIOS_CONFIG);
            const d = r.data;
            const isJson = typeof d === 'object';
            const text = isJson ? JSON.stringify(d) : String(d);
            const hasAmount = text.toLowerCase().includes('amount') || text.match(/\d+\.\d+/) !== null;
            console.log(`\n${url}`);
            console.log(`  Status: ${r.status}, Type: ${typeof d}, HasAmount: ${hasAmount}`);
            if (hasAmount && text.length < 2000) {
                console.log('  Data:', text.substring(0, 300));
            }
        } catch (err) {
            console.log(`\n${url}`);
            console.log(`  Error: ${err.response?.status || err.message}`);
        }
    }

    // Also check for any JSON endpoints in the company page's scripts/XHR
    const mainPage = await axios.get(`https://dps.psx.com.pk/company/${symbol}`, {
        ...AXIOS_CONFIG,
        headers: { ...AXIOS_CONFIG.headers, Accept: 'text/html' }
    });
    const $ = cheerio.load(mainPage.data);

    // Look for data in script tags (often embedded JSON)
    let scriptJsonFound = false;
    $('script').each((i, el) => {
        const src = $(el).html() || '';
        if ((src.includes('dividend') || src.includes('Dividend')) && src.includes('{')) {
            const match = src.match(/(\{[^;]+dividend[^;]+\})/i);
            if (match) {
                console.log('\nFound inline JSON with dividend data:', match[0].substring(0, 200));
                scriptJsonFound = true;
            }
        }
    });
    if (!scriptJsonFound) {
        console.log('\nNo inline dividend JSON found in script tags');
    }
}

testEndpoints('MCB').catch(console.error);
