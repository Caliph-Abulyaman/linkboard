require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const pool = require('./db');
const authRoutes = require('./auth');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'ok', db: 'connected' });
    } catch (err) {
        res.status(503).json({ status: 'error', db: 'unreachable' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`api listening on port ${PORT}`);
});