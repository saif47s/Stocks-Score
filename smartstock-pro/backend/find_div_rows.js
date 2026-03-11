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

async function findDivRows(symbol) {
    const url = `https://dps.psx.com.pk/company/${symbol}`;
    const response = await axios.get(url, AXIOS_CONFIG);
    const $ = cheerio.load(response.data);

    console.log(`\n=== All TR rows with dividend-related text for ${symbol} ===`);
    $('tr').each((i, el) => {
        const text = $(el).text().trim();
        const lp = text.toLowerCase();
        if (lp.includes('div') || lp.includes('credit') || lp.includes('cash') || lp.includes('bonus')) {
            console.log(`TR[${i}]: "${text.substring(0, 200)}"`);
        }
    });
}

findDivRows('MCB').then(() => findDivRows('ENGRO')).catch(console.error);
