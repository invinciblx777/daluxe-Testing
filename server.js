const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf'
};

// Create HTTP server
const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    
    // Parse URL
    let filePath = req.url;
    
    // Handle admin routes
    if (filePath === '/admin' || filePath === '/admin/') {
        filePath = '/admin-login.html';
    } else if (filePath === '/admin-dashboard' || filePath === '/admin-dashboard/') {
        filePath = '/admin-dashboard.html';
    } else if (filePath === '/') {
        filePath = '/index.html';
    }
    
    // Remove query string
    filePath = filePath.split('?')[0];
    
    // Security: prevent directory traversal
    if (filePath.includes('..')) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }
    
    // Construct file path
    let publicPath;
    
    // Handle uploads directory
    if (filePath.startsWith('/uploads/')) {
        publicPath = path.join(__dirname, filePath);
    } else {
        publicPath = path.join(__dirname, 'public', filePath);
    }
    
    // Get file extension
    const ext = path.extname(publicPath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Read and serve file
    fs.readFile(publicPath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found - serve index.html for client-side routing
                if (ext === '') {
                    fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('500 Internal Server Error');
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(data);
                        }
                    });
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                }
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            }
            return;
        }
        
        // Serve file
        res.writeHead(200, { 
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(data);
    });
});

// Start server
server.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Virgin 5.0 - Luxury Ayurvedic Skincare');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  🚀 Server running at: http://localhost:${PORT}`);
    console.log(`  📁 Serving files from: ${path.join(__dirname, 'public')}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('  Press Ctrl+C to stop the server');
    console.log('═══════════════════════════════════════════════════════\n');
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.error('   Please try a different port or stop the other service.');
        process.exit(1);
    } else {
        console.error('❌ Server error:', err);
        process.exit(1);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n📴 SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n📴 SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('✅ HTTP server closed');
        console.log('👋 Goodbye!');
        process.exit(0);
    });
});
