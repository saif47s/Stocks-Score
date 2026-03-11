import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('kel-company-raw.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- Exhaustive Stats Scan ---');
$('.stats_item').each((i, el) => {
    const label = $(el).find('.stats_label').text().trim();
    const value = $(el).find('.stats_value').text().trim();
    console.log(`${i}: [${label}] => [${value}]`);
});

console.log('\n--- Extra Info (Header) ---');
$('.header__company__stats .item').each((i, el) => {
    const label = $(el).find('.label').text().trim();
    const value = $(el).find('.value').text().trim();
    console.log(`${i}: [${label}] => [${value}]`);
});
