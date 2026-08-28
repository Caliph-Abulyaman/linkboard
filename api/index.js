require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const pool = require('./db');
const authRoutes = require('./auth');
const linksRoutes = require('./links');
const tagsRoutes = require('./tags');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);
app.use('/links', linksRoutes);
app.use('/tags', tagsRoutes);

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'ok', db: 'connected' });
    } catch (err) {
        console.error('DB health check failed:', err.message);
        res.status(503).json({ status: 'error', db: 'unreachable' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`api listening on port ${PORT}`);
});