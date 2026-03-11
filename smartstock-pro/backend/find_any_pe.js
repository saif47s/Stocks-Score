import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('kel-company-raw.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- Searching for ANY P/E ---');
$(':contains("P/E")').each((i, el) => {
    const text = $(el).text().trim();
    if (text.length < 50) {
        console.log(`[${i}] Tag: ${el.tagName} | Text: "${text}"`);
        console.log(`    Parent: <${$(el).parent().prop('tagName')} class="${$(el).parent().attr('class')}">`);
        console.log(`    Parent text: "${$(el).parent().text().trim().substring(0, 100).replace(/\s+/g, ' ')}"`);
    }
});
