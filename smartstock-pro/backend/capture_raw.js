import axios from 'axios';
import fs from 'fs';

const AXIOS_CONFIG = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dps.psx.com.pk/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    },
    timeout: 15000
};

async function test() {
    const res = await axios.get('https://dps.psx.com.pk/market-watch', AXIOS_CONFIG);
    fs.writeFileSync('market-watch-raw.html', res.data);
    console.log('Saved market-watch-raw.html');
}

test();
