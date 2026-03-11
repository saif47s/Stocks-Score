import fs from 'fs';

const html = fs.readFileSync('kel-company-raw.html', 'utf8');

const targets = ['EPS (TTM)', 'Dividend Yield', 'Price to BV', 'ROE'];

targets.forEach(target => {
    console.log(`\n--- Target: ${target} ---`);
    let index = html.indexOf(target);
    if (index === -1) {
        console.log('NOT FOUND');
    } else {
        while (index !== -1) {
            console.log(`Found at ${index}:`);
            console.log(html.substring(index - 50, index + 250).replace(/\s+/g, ' '));
            index = html.indexOf(target, index + 1);
        }
    }
});
