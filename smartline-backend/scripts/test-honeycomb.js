
const BASE_URL = 'http://127.0.0.1:3000/api';
const HEALTH_URL = 'http://127.0.0.1:3000/health';

async function runTests() {
    console.log('🐝 Honeycomb Feature Test Script 🐝');
    console.log('===================================');

    try {
        // 1. Diagnostics (Health)
        console.log('\n1. Checking Backend Health...');
        try {
            const res = await fetch(HEALTH_URL);
            const health = await res.json();
            console.log(`   Status Code: ${res.status}`);
            console.log(`   Health Reponse:`, JSON.stringify(health, null, 2));

            if (health.status !== 'ok') {
                console.warn('⚠️ WARNING: Backend reported issues, but proceeding to test specific endpoints...');
            }
        } catch (e) {
            console.error(`❌ Connection failed to ${HEALTH_URL}`);
            console.error('   Is the backend running? (npm run dev)');
            // Proceed anyway, maybe API is up but health is weird
        }

        // 2. Check Feature Flag
        console.log('\n2. Checking Feature Flag...');
        const configUrl = `${BASE_URL}/config/features`;
        try {
            const res = await fetch(configUrl);
            const configReq = await res.json();
            console.log('   Response:', JSON.stringify(configReq));

            if (typeof configReq.honeycomb_enabled !== 'boolean') {
                throw new Error('Invalid config response structure');
            }
            console.log(`✅ Feature Flag Verified: ${configReq.honeycomb_enabled ? 'ON' : 'OFF'}`);
        } catch (e) {
            console.error(`❌ Failed to fetch feature flag: ${e.message}`);
        }

        // 3. Fetch Surge Zones
        console.log('\n3. Fetching Surge Zones...');
        const surgeUrl = `${BASE_URL}/surge/active`;
        try {
            const res = await fetch(surgeUrl);
            const zonesReq = await res.json();

            if (res.status === 200) {
                console.log(`✅ Zones endpoint accessible`);
                console.log(`   Found ${zonesReq.zones?.length ?? 0} active zones.`);
                console.log('   Sample:', zonesReq.zones?.[0] || 'No zones');
            } else {
                console.error(`❌ Zones endpoint returned ${res.status}`);
                console.error('   Response:', zonesReq);
            }
        } catch (e) {
            console.error(`❌ Failed to fetch surge zones: ${e.message}`);
        }

        console.log('\n===================================');
        console.log('🎉 TEST SEQUENCE COMPLETED');
        console.log('===================================');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ SCRIPT CRASHED');
        console.error(`   Error: ${error.message}`);
        process.exit(1);
    }
}

// Run
runTests();
