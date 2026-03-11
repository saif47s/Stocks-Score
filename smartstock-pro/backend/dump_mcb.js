import axios from 'axios';
import * as cheerio from 'cheerio';

const AXIOS_CONFIG = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
};

async function test() {
    try {
        const response = await axios.get('https://dps.psx.com.pk/company/MCB', AXIOS_CONFIG);
        const $ = cheerio.load(response.data);
        
        console.log('--- STATS ITEMS ---');
        $('.stats_item').each((i, el) => {
            console.log($(el).text().trim().replace(/\s+/g, ' '));
        });

        console.log('\n--- TABLES ---');
        $('table tr').each((i, el) => {
            const text = $(el).text().trim().replace(/\s+/g, ' ');
            if (text.toLowerCase().includes('dividend') || text.toLowerCase().includes('profit') || text.toLowerCase().includes('equity')) {
               console.log('Row:', text);
            }
        });
    } catch (e) {
        console.error(e);
    }
}
test();
