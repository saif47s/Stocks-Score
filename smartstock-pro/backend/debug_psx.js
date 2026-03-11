import axios from 'axios';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://dps.psx.com.pk/'
};

async function test() {
    try {
        const url = 'https://dps.psx.com.pk/quotations';
        const res = await axios.get(url, { headers, timeout: 10000 });
        console.log('Keys:', Object.keys(res.data));
        if (Array.isArray(res.data)) {
            console.log('First item keys:', Object.keys(res.data[0]));
            if (res.data[0].quotations) {
                console.log('Quotation keys:', Object.keys(res.data[0].quotations[0]));
            }
        } else if (res.data.quotations) {
            console.log('Quotation keys:', Object.keys(res.data.quotations[0]));
        }
    } catch (e) {
        console.log('ERROR:', e.message);
    }
}

test();
