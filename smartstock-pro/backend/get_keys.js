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
    try {
        const res = await axios.get('https://dps.psx.com.pk/cache/quotations', AXIOS_CONFIG);
        console.log('Keys:', Object.keys(res.data));
        const firstSector = res.data[0];
        console.log('Sector name:', firstSector.sector);
        console.log('Quotations Keys:', Object.keys(firstSector.quotations[0]));
        console.log('Sample Quotation:', JSON.stringify(firstSector.quotations[0], null, 2));
    } catch (e) {
        console.error(e.message);
    }
}

dump();
