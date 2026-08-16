require('dotenv').config();

const { Worker } = require('bullmq');
const pool = require('./db');

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
};

const worker = new Worker(
    'link-enrichment',
    async (job) => {
        const { linkId, url } = job.data;
        console.log(`processing job ${job.id}: fetching ${url}`);

        // Placeholder for now — real scraping logic comes next
        const title = 'placeholder title';
        const faviconUrl = null;

        await pool.query(
            'UPDATE links SET title = $1, favicon_url = $2 WHERE id = $3',
            [title, faviconUrl, linkId]
        );

        console.log(`job ${job.id} done: link ${linkId} updated`);
    },
    { connection }
);

worker.on('completed', (job) => {
    console.log(`job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`job ${job.id} failed:`, err.message);
});

console.log('worker started, waiting for jobs...')