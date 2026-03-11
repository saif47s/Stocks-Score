import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('market-watch-raw.html', 'utf8');
const $ = cheerio.load(html);

const kelRow = $('tr').filter((i, el) => $(el).find('td[data-search="KEL"]').length > 0).first();

if (kelRow.length > 0) {
    const tds = kelRow.find('td');
    console.log('--- KEL ROW STRUCTURE ---');
    tds.each((i, el) => {
        console.log(`${i}: [${$(el).text().trim()}] | order=[${$(el).attr('data-order')}]`);
    });
} else {
    console.log('KEL NOT FOUND');
}
