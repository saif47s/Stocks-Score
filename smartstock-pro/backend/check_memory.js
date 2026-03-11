import axios from 'axios';

async function check() {
    const res = await axios.get('http://localhost:3002/api/stocks');
    const summarize = (s) => ({
        symbol: s.symbol,
        price: s.closePrice,
        pe: s.peRatio,
        roe: s.roe,
        div: s.dividendYield,
        score: s.totalScore
    });

    const mcb = res.data.data.find(s => s.symbol === 'MCB');
    const kel = res.data.data.find(s => s.symbol === 'KEL');

    console.log('MCB:', summarize(mcb));
    console.log('KEL:', summarize(kel));

    const withPE = res.data.data.filter(s => s.peRatio > 0).length;
    console.log('Total stocks with PE > 0:', withPE);
}

check();
