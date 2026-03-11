import axios from 'axios';

const AXIOS_CONFIG = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dps.psx.com.pk/',
        'Accept': 'application/json, text/plain, */*'
    },
    timeout: 15000
};

async function test() {
    const endpoints = [
        'https://dps.psx.com.pk/quotations',
        'https://dps.psx.com.pk/cache/quotations',
        'https://dps.psx.com.pk/market-watch',
        'https://dps.psx.com.pk/symbols'
    ];

    for (const url of endpoints) {
        try {
            console.log(`\n--- Testing ${url} ---`);
            const res = await axios.get(url, AXIOS_CONFIG);
            console.log(`SUCCESS [${res.status}] Content-Type: ${res.headers['content-type']}`);
            if (typeof res.data === 'string') {
                console.log('Snippet:', res.data.substring(0, 200));
            } else {
                console.log('Keys:', Object.keys(Array.isArray(res.data) ? res.data[0] || {} : res.data));
            }
        } catch (e) {
            console.log(`FAILED: ${e.message}`);
        }
    }
}

test();
