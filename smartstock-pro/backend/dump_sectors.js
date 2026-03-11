import axios from 'axios';
import fs from 'fs';

async function check() {
    try {
        const res = await axios.get('http://localhost:3002/api/stocks');
        const sectors = [...new Set(res.data.data.map(s => s.sector))].sort();
        fs.writeFileSync('sectors_dump.json', JSON.stringify(sectors, null, 2));
        console.log('Saved sectors_dump.json');
    } catch (err) {
        console.log('Error:', err.message);
    }
}

check();
