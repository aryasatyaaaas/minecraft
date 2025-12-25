const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const packageRoutes = require('./routes/packages');
const billingRoutes = require('./routes/billing');
const serverRoutes = require('./routes/servers');

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 for dev, 100 for production
    message: 'Too many requests from this IP, please try again later.',
});

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/api/', limiter);

app.get('/', (req, res) => {
    res.json({
        message: 'Minecraft Hosting Platform API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            packages: '/api/packages',
            billing: '/api/billing',
            servers: '/api/servers',
        },
    });
});

app.use('/api/auth', authRoutes);
app.use('/api', packageRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/servers', serverRoutes);

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║  Minecraft Hosting Platform API               ║
║  Server running on port ${PORT}                   ║
║  Environment: ${process.env.NODE_ENV || 'development'}                    ║
╚════════════════════════════════════════════════╝
  `);
    console.log(`✓ API available at http://localhost:${PORT}`);
    console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL}`);
});

module.exports = app;
