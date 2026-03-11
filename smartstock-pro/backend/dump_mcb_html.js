import axios from 'axios';
import fs from 'fs';

const AXIOS_CONFIG = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dps.psx.com.pk/',
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8'
    },
    timeout: 15000
};

const r = await axios.get('https://dps.psx.com.pk/company/MCB', AXIOS_CONFIG);
fs.writeFileSync('MCB_full_page.html', r.data);
console.log('Saved MCB_full_page.html, size:', r.data.length, 'bytes');

// Search for ROE/PB patterns
const html = r.data;
const patterns = [
    /P\/B[^"<]*(?:Ratio)?/gi,
    /Price.?to.?Book/gi,
    /Price.?Book/gi,
    /Book.?Value/gi,
    /ROE/gi,
    /Return.?on.?Equity/gi,
    /Dividend.?Yield/gi,
    /Payout/gi,
];

for (const p of patterns) {
    const matches = html.match(p);
    if (matches) {
        console.log(`Pattern ${p}:`, [...new Set(matches)]);
    }
}
