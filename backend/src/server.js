const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({ origin: true, credentials: true }));

// routes (will exist if created)
try { app.use('/api/v1/auth', require('./routes/auth')); } catch (e) { /* ignore */ }
try { app.use('/api/v1/tasks', require('./routes/tasks')); } catch (e) { /* ignore */ }

app.get('/', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
