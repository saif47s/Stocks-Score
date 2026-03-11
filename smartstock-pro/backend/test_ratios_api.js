import axios from 'axios';

const AXIOS_CONFIG = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dps.psx.com.pk/company/MCB',
        'Accept': 'application/json, text/html, */*',
        'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: 15000
};

const symbol = 'MCB';
const endpoints = [
    `https://dps.psx.com.pk/ratios/${symbol}`,
    `https://dps.psx.com.pk/api/ratios/${symbol}`,
    `https://dps.psx.com.pk/company/${symbol}/ratios`,
    `https://dps.psx.com.pk/company/${symbol}/financials`,
    `https://dps.psx.com.pk/quotations/${symbol}/ratios`,
    `https://dps.psx.com.pk/analytics/${symbol}`,
    `https://dps.psx.com.pk/company/${symbol}/fundamental`,
];

for (const url of endpoints) {
    try {
        const r = await axios.get(url, AXIOS_CONFIG);
        const d = r.data;
        const text = typeof d === 'object' ? JSON.stringify(d) : String(d);
        const relevant = ['roe', 'pb', 'book', 'dividend', 'yield', 'ratio'].some(k => text.toLowerCase().includes(k));
        console.log(`\n${url}`);
        console.log(`  Status: ${r.status}, HasRelevant: ${relevant}, Len: ${text.length}`);
        if (relevant) console.log('  Sample:', text.substring(0, 300));
    } catch (err) {
        console.log(`\n${url} => ${err.response?.status || err.message}`);
    }
}
