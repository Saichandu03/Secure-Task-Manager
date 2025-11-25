const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('xss-clean');

const { connectDB } = require('./config/db');
const redis = require('./config/redisClient');
const errorHandler = require('./middleware/errorHandler');

require('dotenv').config();

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || null;
const corsOptions = { credentials: true };
if (FRONTEND_ORIGIN) corsOptions.origin = FRONTEND_ORIGIN; else corsOptions.origin = true;
app.use(cors(corsOptions));

// attach routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/tasks', require('./routes/tasks'));

app.get('/', (req, res) => res.json({ status: 'ok' }));

// error handler
app.use(errorHandler);

// start server after DB and cache initialization (best-effort)
const PORT = process.env.PORT || 5000;
async function start() {
	await connectDB(process.env.MONGO_URI);
	// initialize in-process cache (LRU). This replaces Redis for local/demo runs.
	try { await redis.init(); } catch (e) { console.warn('Cache init warning', e && e.message ? e.message : e); }
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();

module.exports = app;
