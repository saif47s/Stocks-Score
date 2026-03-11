import axios from 'axios';

const AXIOS_CONFIG = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://financials.psx.com.pk/',
        'Accept': 'application/json, text/html, */*'
    },
    timeout: 15000
};

async function fetch(symbol) {
    const urls = [
        `https://financials.psx.com.pk/ratios?symbol=${symbol}`,
        `https://financials.psx.com.pk/financials?symbol=${symbol}`,
        `https://dps.psx.com.pk/financials/${symbol}`,
        `https://dps.psx.com.pk/dividends/${symbol}`,
    ];

    for (const url of urls) {
        try {
            console.log(`\nTrying: ${url}`);
            const r = await axios.get(url, AXIOS_CONFIG);
            const d = r.data;
            if (typeof d === 'object') {
                console.log('  => JSON Keys:', Object.keys(d).slice(0, 15));
                // Look for dividend/roe keys
                const str = JSON.stringify(d).toLowerCase();
                if (str.includes('dividend') || str.includes('roe') || str.includes('yield')) {
                    console.log('  *** Contains dividend/roe/yield data! ***');
                    console.log('  Sample:', JSON.stringify(d).substring(0, 500));
                }
            } else {
                const text = String(d);
                if (text.toLowerCase().includes('dividend') || text.toLowerCase().includes('roe')) {
                    console.log('  *** Contains dividend/roe! First 300 chars:');
                    console.log('  ', text.substring(0, 300));
                } else {
                    console.log('  => HTML/text, no relevant content. Status:', r.status, 'Length:', text.length);
                }
            }
        } catch (err) {
            console.log(`  => Error: ${err.message}`);
        }
    }
}

fetch('MCB').catch(console.error);
