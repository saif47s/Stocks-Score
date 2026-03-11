import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('kel-company-raw.html', 'utf8');
const $ = cheerio.load(html);

const targets = ['P/E (TTM)', 'EPS (TTM)', 'Market Cap', 'Price to BV', 'Dividend Yield'];

targets.forEach(target => {
    console.log(`\n--- Searching for [${target}] ---`);
    $(`*:contains("${target}")`).each((i, el) => {
        const text = $(el).text().trim();
        // Look for elements where the text contains the target and is not too long
        if (text.toLowerCase().includes(target.toLowerCase()) && text.length < 50) {
            console.log(`Found [${target}] in <${el.tagName}> with text "${text}"`);

            let current = $(el);
            for (let depth = 0; depth < 2; depth++) {
                console.log(`  Level ${depth} Parent: <${current.parent().prop('tagName')} class="${current.parent().attr('class')}">`);
                console.log(`  HTML: ${current.parent().html().substring(0, 200)}`);
                current = current.parent();
            }
        }
    });
});
