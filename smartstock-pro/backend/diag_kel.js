import axios from 'axios';
import fs from 'fs';

async function check() {
    try {
        const res = await axios.get('http://localhost:3002/api/stocks');
        const kel = res.data.data.find(s => s.symbol === 'KEL');
        fs.writeFileSync('kel_full_check.json', JSON.stringify(kel, null, 2));
        console.log('Saved kel_full_check.json');
    } catch (err) {
        console.log('Error:', err.message);
    }
}

check();
