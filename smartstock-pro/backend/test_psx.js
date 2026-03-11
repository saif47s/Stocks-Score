import axios from 'axios';

const endpoints = [
    'https://dps.psx.com.pk/cache/quotations',
    'https://dps.psx.com.pk/quotations',
    'https://dps.psx.com.pk/symbols'
];

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://dps.psx.com.pk/'
};

async function test() {
    for (const url of endpoints) {
        try {
            console.log(`\n--- Testing ${url} ---`);
            const res = await axios.get(url, { headers, timeout: 5000 });
            console.log(`SUCCESS [${res.status}]`);
            let item = Array.isArray(res.data) ? res.data[0] : (res.data.quotations ? res.data.quotations[0] : res.data);
            console.log('Sample Item:', JSON.stringify(item).substring(0, 200));
        } catch (e) {
            console.log(`FAILED [${e.response?.status || 'ERR'}]: ${url}`);
        }
    }
}

test();
