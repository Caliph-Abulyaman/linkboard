const express = require('express');
const pool = require('./db');
const requireAuth = require('./middleware/requireAuth');
const linkEnrichmentQueue = require('./queue');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'url is required' });
    }

    const result = await pool.query(
        'INSERT INTO links (url, submitted_by) VALUES ($1, $2) RETURNING id, url, title, favicon_url, submitted_by, created_at',
        [url, req.userId]
    );

    const link = result.rows[0];

    await linkEnrichmentQueue.add('enrich-link', { linkId: link.id, url: link.url });

    res.status(201).json(link);
});

router.get('/', async (req, res) => {
    const result = await pool.query(
        'SELECT id, url, title, favicon_url, submitted_by, created_at FROM links ORDER BY created_at DESC'
    );
    res.status(200).json(result.rows);
});

router.post('/:id/upvote', requireAuth, async (req, res) => {
    const linkId = req.params.id;

    try {
        await pool.query(
            'INSERT INTO upvotes (link_id, user_id) VALUES ($1, $2)',
            [linkId, req.userId]
        );
        res.status(201).json({ linkId, upvoted: true });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'already upvoted' });
        }
        throw err;
    }
});

router.post('/:id/tags', requireAuth, async (req, res) => {
    const linkId = req.params.id;
    const { tagId } = req.body;
    if (!tagId) {
        return res.status(400).json({ error: 'tagId is required' });
    }

    try {
        await pool.query(
            'INSERT INTO link_tags (link_id, tag_id) VALUES ($1, $2)',
            [linkId, tagId]
        );
        res.status(201).json({ linkId, tagId });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'link already has this tag' });
        }
        throw err;
    }
});

module.exports = router;