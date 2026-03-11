import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

const AXIOS_CONFIG = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://dps.psx.com.pk/',
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8'
    },
    timeout: 15000
};

async function findDividendData(symbol) {
    const url = `https://dps.psx.com.pk/company/${symbol}`;
    console.log(`Fetching ${url}...`);
    const response = await axios.get(url, AXIOS_CONFIG);
    const $ = cheerio.load(response.data);

    // Search all text nodes for dividend/roe/yield
    const keywords = ['dividend', 'yield', 'roe', 'return on equity', 'payout'];

    // Check all table rows
    console.log('\n=== Table rows containing dividend/ROE/yield keywords ===');
    $('tr').each((i, el) => {
        const text = $(el).text().toLowerCase();
        if (keywords.some(k => text.includes(k))) {
            console.log(`TR[${i}]: ${$(el).text().trim().substring(0, 150)}`);
        }
    });

    // Check all divs/spans
    console.log('\n=== Elements with class containing dividend/financial ===');
    $('[class*="dividend"], [class*="financial"], [class*="ratio"], [class*="yield"], [class*="roe"]').each((i, el) => {
        if (i < 10) {
            console.log(`Element: ${el.name}.${$(el).attr('class')} => "${$(el).text().trim().substring(0, 100)}"`);
        }
    });

    // Check for any data attributes
    console.log('\n=== Stats label index 14 (PE) exact text ===');
    const peItem = $('.stats_item').eq(14);
    console.log('Label:', peItem.find('.stats_label').text());
    console.log('Value:', peItem.find('.stats_value').text());

    // Check if there's an EPS section
    console.log('\n=== Any element with EPS or Dividend in text ===');
    $('*').filter(function () {
        const text = $(this).children().length === 0 ? $(this).text().trim() : '';
        return text.toLowerCase().includes('dividend') || text.toLowerCase().includes('eps');
    }).each((i, el) => {
        if (i < 15) {
            const parent = $(el).parent().text().trim().substring(0, 120);
            console.log(`  [${i}] Text: "${$(el).text().trim()}" | Parent: "${parent}"`);
        }
    });
}

findDividendData('ENGRO').catch(console.error);
