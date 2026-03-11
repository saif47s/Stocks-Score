import axios from 'axios';
import * as cheerio from 'cheerio';

const AXIOS_CONFIG = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
};

async function test() {
    try {
        const response = await axios.get('https://dps.psx.com.pk/indices', AXIOS_CONFIG);
        const $ = cheerio.load(response.data);
        console.log('--- INDICES TABLE ---');
        $('.indices__item').each((i, el) => {
            const name = $(el).find('.indices__item__name').text().trim();
            const val = $(el).find('.indices__item__val').text().trim();
            console.log('Item:', name, val);
        });

        $('table tr').each((i, el) => {
            const tds = $(el).find('td');
            if (tds.length >= 2) {
                console.log('Row:', $(el).text().trim().replace(/\s+/g, ' '));
            }
        });
    } catch (e) {
        console.error(e);
    }
}
test();
