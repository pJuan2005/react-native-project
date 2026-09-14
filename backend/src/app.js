const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Web Admin Dashboard static files
app.use('/admin', express.static(path.join(__dirname, '../../admin-web')));

// Mount Main API Router
app.use('/api', routes);

// 404 & Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
