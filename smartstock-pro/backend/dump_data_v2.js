import axios from 'axios';

const AXIOS_CONFIG = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dps.psx.com.pk/',
        'Accept': 'application/json, text/plain, */*'
    },
    timeout: 15000
};

async function dump() {
    const urls = [
        'https://dps.psx.com.pk/cache/quotations',
        'https://dps.psx.com.pk/symbols',
    ];

    for (const url of urls) {
        try {
            console.log(`\n--- Testing ${url} ---`);
            const res = await axios.get(url, AXIOS_CONFIG);
            console.log(`SUCCESS [${res.status}]`);
            const data = res.data;

            if (Array.isArray(data)) {
                console.log('Count:', data.length);
                console.log('Sample Keys:', Object.keys(data[0] || {}));
                console.log('Sample Data:', JSON.stringify(data[0], null, 2));
            } else {
                console.log('Keys:', Object.keys(data));
                if (data.quotations) {
                    console.log('Quotations Count:', data.quotations.length);
                    console.log('Sample Quotation Keys:', Object.keys(data.quotations[0] || {}));
                    console.log('Sample Quotation Data:', JSON.stringify(data.quotations[0], null, 2));
                } else if (Array.isArray(data[0]?.quotations)) {
                    console.log('Nested Quotations Count:', data[0].quotations.length);
                    console.log('Sample Nested Quotation Keys:', Object.keys(data[0].quotations[0] || {}));
                    console.log('Sample Nested Quotation Data:', JSON.stringify(data[0].quotations[0], null, 2));
                }
            }
        } catch (e) {
            console.error(`FAILED: ${e.message}`);
        }
    }
}

dump();
