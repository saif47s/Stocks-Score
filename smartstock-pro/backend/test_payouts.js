import axios from 'axios';
import qs from 'qs';

const AXIOS_CONFIG = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dps.psx.com.pk/company/MCB',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest'
    }
};

async function test() {
    try {
        const response = await axios.post('https://dps.psx.com.pk/company/payouts', qs.stringify({ symbol: 'MCB' }), AXIOS_CONFIG);
        console.log('Payouts HTML Size:', response.data.length);
        console.log('Snippet:', response.data.slice(0, 1000));
    } catch (e) {
        console.error('Fetch Failed:', e.message);
    }
}

test();
