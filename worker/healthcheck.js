const fs = require('fs');

try {
    const data = fs.readFileSync('/tmp/health.json', 'utf8');
    const healthData = JSON.parse(data);

    if (!healthData.status || !healthData.timeStamp) {
        console.error('Health check failed: missing required fields');
        process.exit(1);
    }

    if (healthData.status !== 'ready') {
        console.error(`Health check failed: status is ${healthData.status}`);
        process.exit(1);
    }

    const age = new Date() - new Date(healthData.timeStamp).getTime();

    if (age > 30000) { // 30 seconds
        console.error('Health check failed: data is stale');
        process.exit(1);
    }

    console.log('Health check passed');
    process.exit(0);

} catch (error) {
    console.error('Error reading health.json:', error);
    process.exit(1);
}