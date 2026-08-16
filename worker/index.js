require('dotenv').config();

const { Worker } = require('bullmq');
const cheerio = require('cheerio');
const pool = require('./db');

require('dns').setDefaultResultOrder('ipv4first');

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
};

const worker = new Worker(
    'link-enrichment',
    async (job) => {
        const { linkId, url } = job.data;
        console.log(`processing job ${job.id}: fetching ${url}`);

        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('title').first().text().trim() || null;

        let faviconUrl = $('link[rel="icon"]').attr('href')
            || $('link[rel="shortcut icon"]').attr('href')
            || '/favicon.ico';

        faviconUrl = new URL(faviconUrl, url).href;

        await pool.query(
            'UPDATE links SET title = $1, favicon_url = $2 WHERE id = $3',
            [title, faviconUrl, linkId]
        );

        console.log(`job ${job.id} done: link ${linkId} updated with title "${title}"`);
    },
    { connection }
);

worker.on('completed', (job) => {
    console.log(`job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`job ${job.id} failed:`, err.message);
    console.error('cause:', err.cause);
});

console.log('worker started, waiting for jobs...');