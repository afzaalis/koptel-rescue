require('dotenv').config();
const express = require('express');
const cors = require('cors');
const salesRoutes = require('./routes/salesRoutes');
const authRoutes = require('./routes/authRoutes');
const aiHelperRoutes = require('./routes/aiHelperRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

const kopegRoutes = require('./routes/kopegRoutes');
const kmRoutes = require('./routes/kmRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/sales', salesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai-helper', aiHelperRoutes);
app.use('/api/budget', budgetRoutes);

app.use('/api/kopeg', kopegRoutes);
app.use('/api/km', kmRoutes);

app.get('/', (req, res) => {
    res.send('Sales Dashboard Backend is running!');
});

module.exports = app;