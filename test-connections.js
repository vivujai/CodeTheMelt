/**
 * Node.js script to test all API connections
 * Run with: node test-connections.js
 */

const https = require('https');
const http = require('http');

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        client.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (error) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

async function testConnections() {
    console.log('🧪 Testing Ice Sheet Visualization API Connections...\n');
    
    const tests = [
        {
            name: 'Health Check',
            url: 'http://localhost:8080/api/icesheet/health'
        },
        {
            name: 'Greenland Details',
            url: 'http://localhost:8080/api/icesheet/GREENLAND/details'
        },
        {
            name: 'Antarctica Details',
            url: 'http://localhost:8080/api/icesheet/ANTARCTICA/details'
        },
        {
            name: 'Greenland Annual Visualization',
            url: 'http://localhost:8080/api/icesheet/GREENLAND/visualization?period=ANNUAL'
        },
        {
            name: 'Antarctica Annual Visualization',
            url: 'http://localhost:8080/api/icesheet/ANTARCTICA/visualization?period=ANNUAL'
        },
        {
            name: 'Greenland Decade Visualization',
            url: 'http://localhost:8080/api/icesheet/GREENLAND/visualization?period=DECADE'
        },
        {
            name: 'Antarctica Century Visualization',
            url: 'http://localhost:8080/api/icesheet/ANTARCTICA/visualization?period=CENTURY'
        }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            console.log(`Testing: ${test.name}...`);
            const result = await makeRequest(test.url);
            
            if (result.status === 200) {
                console.log(`✅ ${test.name} - SUCCESS`);
                
                // Show some data details
                if (test.name.includes('Details')) {
                    console.log(`   Size: ${result.data.currentSize?.toLocaleString()} km²`);
                    console.log(`   Temperature: ${result.data.ambientTemperature}°C`);
                    console.log(`   Melting Rate: ${result.data.meltingRate} kg/s`);
                } else if (test.name.includes('Visualization')) {
                    console.log(`   Mass Loss: ${Math.abs(result.data.massLoss)?.toLocaleString()} kg`);
                    console.log(`   Initial Size: ${result.data.initialSize?.toLocaleString()} km²`);
                    console.log(`   Period: ${result.data.period}`);
                } else if (test.name.includes('Health')) {
                    console.log(`   Status: ${result.data.status}`);
                    console.log(`   Total Requests: ${result.data.totalCalculatorRequests}`);
                }
                
                passed++;
            } else {
                console.log(`❌ ${test.name} - FAILED (Status: ${result.status})`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} - ERROR: ${error.message}`);
            failed++;
        }
        
        console.log(''); // Empty line for readability
    }
    
    console.log('📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All API connections are working correctly!');
        console.log('✅ Frontend-Backend integration is ready.');
    } else {
        console.log('\n⚠️  Some connections failed. Check the backend server.');
    }
}

// Run the tests
testConnections().catch(console.error);