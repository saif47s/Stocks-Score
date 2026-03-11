import axios from 'axios';

const AXIOS_CONFIG = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dps.psx.com.pk/',
        'Accept': 'application/json, text/plain, */*'
    },
    timeout: 10000
};

async function dump() {
    try {
        console.log('--- SYMBOLS ---');
        const sRes = await axios.get('https://dps.psx.com.pk/symbols', AXIOS_CONFIG);
        console.log('Symbols Length:', sRes.data.length);
        console.log('First 2 Symbols:', JSON.stringify(sRes.data.slice(0, 2), null, 2));

        console.log('\n--- QUOTATIONS ---');
        const qRes = await axios.get('https://dps.psx.com.pk/quotations', AXIOS_CONFIG);
        const qData = qRes.data;
        console.log('Quotations Type:', Array.isArray(qData) ? 'Array' : typeof qData);

        let quotations = [];
        if (Array.isArray(qData)) {
            console.log('First element keys:', Object.keys(qData[0]));
            quotations = qData[0]?.quotations || qData;
        } else if (qData && qData.quotations) {
            quotations = qData.quotations;
        }

        console.log('Total Quotations Found:', quotations.length);
        console.log('First 2 Quotations:', JSON.stringify(quotations.slice(0, 2), null, 2));

    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

dump();
