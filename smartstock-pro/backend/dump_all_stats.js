import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('kel-company-raw.html', 'utf8');
const $ = cheerio.load(html);

const stats = [];
$('.stats_item').each((i, el) => {
    const label = $(el).find('.stats_label').text().trim();
    const value = $(el).find('.stats_value').text().trim();
    if (label) {
        stats.push({ label, value });
    }
});

fs.writeFileSync('kel_stats_dump.json', JSON.stringify(stats, null, 2));
console.log('Dumped', stats.length, 'stats to kel_stats_dump.json');
