const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware - Helmet for setting various HTTP headers
// Disable CSP in development to avoid issues with local network access
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));

// Compression middleware - Gzip compression for responses
app.use(compression());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: isProduction ? '1d' : 0, // Cache static files in production
  etag: true,
  setHeaders: (res, filePath) => {
    // Set proper content types and CORS headers for local network access
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    // Allow cross-origin access for local network testing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Handle SPA routing - serve index.html for HTML routes only
app.get('*', (req, res, next) => {
  // Don't serve index.html for static file requests
  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware - must be last
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Send appropriate error response
  const statusCode = err.statusCode || 500;
  const message = isProduction ? 'Something went wrong!' : err.message;
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: message
    }
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  // Find LAN IP (e.g., 192.168.x.x)
  const nets = os.networkInterfaces();
  let lanIP = '0.0.0.0';

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        lanIP = net.address;
      }
    }
  }

  console.log(`\nBeth-Nahrin website running:`);
  console.log(` Local:   http://localhost:${PORT}`);
  console.log(` Network: http://${lanIP}:${PORT}`);
  console.log(` Environment: ${isProduction ? 'production' : 'development'}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
