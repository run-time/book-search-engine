import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get project root directory
const projectRoot = path.resolve(__dirname, '..');
const serverDistDir = path.join(projectRoot, 'server', 'dist');
const serverSrcDir = path.join(projectRoot, 'server', 'src');
const clientDistDir = path.join(projectRoot, 'client', 'dist');
const serverPublicDir = path.join(serverDistDir, 'public');

console.log('🚨 Running emergency build...');

// Create dist directory if it doesn't exist
if (!fs.existsSync(serverDistDir)) {
  console.log(`Creating server dist directory: ${serverDistDir}`);
  fs.mkdirSync(serverDistDir, { recursive: true });
}

// Create minimal server.js file
const minimalServerJs = `
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';

// ES Modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jmont23:thetester@cluster0.sxoiyua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  const debugInfo = {
    env: process.env.NODE_ENV,
    dirname: __dirname,
    cwd: process.cwd(),
    mongoUri: process.env.MONGODB_URI ? 'configured' : 'missing',
    directories: {}
  };

  const dirsToCheck = [
    { name: 'serverDist', path: __dirname },
    { name: 'publicDir', path: path.join(__dirname, 'public') },
    { name: 'clientDist', path: path.resolve(__dirname, '../../client/dist') },
    { name: 'root', path: process.cwd() },
  ];

  dirsToCheck.forEach(dir => {
    try {
      if (fs.existsSync(dir.path)) {
        debugInfo.directories[dir.name] = { 
          exists: true, 
          contents: fs.readdirSync(dir.path) 
        };
      } else {
        debugInfo.directories[dir.name] = { exists: false };
      }
    } catch (err) {
      debugInfo.directories[dir.name] = { error: err.message };
    }
  });

  res.json(debugInfo);
});

// Find client files
let clientDistPath = '';
const possiblePaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.join(__dirname, 'public'),
];

// Find first path that exists
for (const pathToCheck of possiblePaths) {
  if (fs.existsSync(pathToCheck)) {
    clientDistPath = pathToCheck;
    console.log(\`Found client directory at: \${clientDistPath}\`);
    break;
  }
}

// Serve static files
if (clientDistPath) {
  app.use(express.static(clientDistPath));
}

// GraphQL placeholder
app.get('/graphql', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head>
      <title>GraphQL API</title>
      <style>
        body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #4a25aa; }
      </style>
    </head>
    <body>
      <h1>GraphQL API</h1>
      <p>GraphQL playground is not available in emergency mode.</p>
      <p>Please check back later when the full application is running.</p>
    </body>
    </html>
  \`);
});

// Fallback route
app.get('*', (req, res) => {
  if (clientDistPath) {
    const indexPath = path.join(clientDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
      return;
    }
  }

  // Fallback HTML
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head>
      <title>book-search-engine</title>
      <style>
        body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .container { background: #f5f5f5; border-radius: 8px; padding: 2rem; margin-top: 2rem; }
        h1 { color: #4a25aa; }
        a { color: #4a25aa; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>book-search-engine - Book Search Engine</h1>
        <p>Emergency mode active. Full application is not available at the moment.</p>
        <p><a href="/debug">View Debug Information</a></p>
      </div>
    </body>
    </html>
  \`);
});

// Start server
app.listen(PORT, () => {
  console.log(\`Emergency server running on port \${PORT}\`);
});
`;

console.log('Creating minimal server.js...');
fs.writeFileSync(path.join(serverDistDir, 'server.js'), minimalServerJs);

// Create public directory if it doesn't exist
if (!fs.existsSync(serverPublicDir)) {
  console.log(`Creating public directory: ${serverPublicDir}`);
  fs.mkdirSync(serverPublicDir, { recursive: true });
}

// Create minimal index.html if needed
if (!fs.existsSync(path.join(serverPublicDir, 'index.html'))) {
  console.log('Creating minimal index.html...');
  const minimalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>book-search-engine - Emergency Mode</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    .container { background: #f5f5f5; border-radius: 8px; padding: 2rem; margin-top: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { color: #4a25aa; }
    a { color: #4a25aa; }
    .btn { display: inline-block; background: #4a25aa; color: white; padding: 0.5rem 1rem; border-radius: 4px; text-decoration: none; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>book-search-engine - Book Search Engine</h1>
    <p>This is an emergency backup page. The full application is currently unavailable.</p>
    <p>Please try again later or contact support if the issue persists.</p>
    <a href="/debug" class="btn">View Debug Information</a>
  </div>
</body>
</html>
  `;
  fs.writeFileSync(path.join(serverPublicDir, 'index.html'), minimalHtml);
}

// Try to copy client files if they exist
if (fs.existsSync(clientDistDir)) {
  console.log(`Copying client files from ${clientDistDir} to ${serverPublicDir}...`);
  try {
    // List files in client dist
    const clientFiles = fs.readdirSync(clientDistDir);
    
    // Copy each file
    clientFiles.forEach(file => {
      const srcPath = path.join(clientDistDir, file);
      const destPath = path.join(serverPublicDir, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        console.log(`Copying directory: ${file}`);
        copyDirectory(srcPath, destPath);
      } else {
        console.log(`Copying file: ${file}`);
        fs.copyFileSync(srcPath, destPath);
      }
    });
    
    console.log('Client files copied successfully');
  } catch (error) {
    console.error('Error copying client files:', error);
  }
}

console.log('🚨 Emergency build completed');

// Helper function to recursively copy directories
function copyDirectory(source, destination) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  
  // Read source directory
  const files = fs.readdirSync(source);
  
  // Copy each file/directory
  files.forEach(file => {
    const srcPath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      // Recursively copy subdirectory
      copyDirectory(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
  });
}