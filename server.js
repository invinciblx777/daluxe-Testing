const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Explicit Route Handlers
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin Route - Redirects or serves login
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Admin Dashboard Route
app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// SPA Fallback for client-side routing (e.g. /products, /about)
// This excludes /api routes if you had them, but for now we catch all non-file requests
app.get(/(.*)/, (req, res) => {
    // If the request is for a file that exists (and wasn't caught by static), let it 404 naturally? 
    // No, express.static handles existing files first.
    // If we are here, it means no static file was found.
    // We should fallback to index.html for SPA routes.

    // However, we should verify it's not looking for a missing asset like .css or .js
    if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
        res.status(404).send('Not Found');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Serving static files from ${path.join(__dirname, 'public')}`);
});

module.exports = app;
