import { PSXDataAdapter } from './dataAdapter.js';

async function debug() {
    console.log('--- Testing Symbols Metadata ---');
    const symbols = await PSXDataAdapter.getSymbolsMetadata();
    console.log('Symbols Count:', symbols.length);
    console.log('Sample Symbol:', JSON.stringify(symbols[0], null, 2));

    console.log('\n--- Testing Market Watch Scraping ---');
    const marketData = await PSXDataAdapter.getMarketWatchData();
    console.log('Market Data Count:', marketData.length);
    if (marketData.length > 0) {
        const kel = marketData.find(x => x.symbol === 'KEL');
        console.log('KEL Data:', JSON.stringify(kel, null, 2));
        console.log('First 5 items:', JSON.stringify(marketData.slice(0, 5), null, 2));
    } else {
        console.log('NO MARKET DATA FOUND');
    }
}

debug();
