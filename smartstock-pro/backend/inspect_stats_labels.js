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

async function inspectCompanyPage(symbol) {
    const url = `https://dps.psx.com.pk/company/${symbol}`;
    console.log(`Fetching ${url}...`);
    const response = await axios.get(url, AXIOS_CONFIG);
    const $ = cheerio.load(response.data);

    const allLabels = [];
    console.log(`\n=== ALL .stats_item labels for ${symbol} ===`);
    $('.stats_item').each((i, el) => {
        const label = $(el).find('.stats_label').text().trim();
        const value = $(el).find('.stats_value').text().trim();
        allLabels.push({ i, label, value });
        console.log(`  [${i}] "${label}" => "${value}"`);
    });
    fs.writeFileSync(`${symbol}_stats_labels.json`, JSON.stringify(allLabels, null, 2));
    console.log(`\nSaved ${symbol}_stats_labels.json`);
}

inspectCompanyPage('MCB').catch(console.error);
