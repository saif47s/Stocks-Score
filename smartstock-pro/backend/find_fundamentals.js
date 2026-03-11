import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('kel-company-raw.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- Searching for Fundamentals ---');

const targets = ['P/E', 'EPS', 'Market Cap', 'Price to BV', 'Yield'];

targets.forEach(target => {
    console.log(`\nTarget: ${target}`);
    $(`*:contains("${target}")`).each((i, el) => {
        // Only look at elements that don't have too many children (leaf nodes or containers of the value)
        if ($(el).children().length < 5) {
            const text = $(el).text().trim().replace(/\s+/g, ' ');
            if (text.length < 200) {
                console.log(`  Path: ${$(el).prop('tagName')} | Text: "${text}"`);
            }
        }
    });
});
