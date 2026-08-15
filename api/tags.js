const express = require('express');
const pool = require('./db');
const requireAuth = require('./middleware/requireAuth');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'name is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO tags (name) VALUES ($1) RETURNING id, name',
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'tag already exists' });
        }
        throw err;
    }
});

router.get('/', async (req, res) => {
    const result = await pool.query('SELECT id, name FROM tags ORDER BY name');
    res.status(200).json(result.rows);
});

module.exports = router;