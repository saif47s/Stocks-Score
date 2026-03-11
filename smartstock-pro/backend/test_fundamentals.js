import { PSXDataAdapter } from './dataAdapter.js';

async function test() {
    console.log('--- Testing KEL Fundamentals ---');
    const data = await PSXDataAdapter.getCompanyFundamentals('KEL');
    console.log('Result:', JSON.stringify(data, null, 2));
}

test();
