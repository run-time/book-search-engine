import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get project root directory
const projectRoot = path.resolve(__dirname, '..');

console.log('📦 Running post-build tasks...');

// Define key directories
const serverDistDir = path.join(projectRoot, 'server', 'dist');
const clientDistDir = path.join(projectRoot, 'client', 'dist');
const serverPublicDir = path.join(serverDistDir, 'public');

// Check if server/dist exists
if (!fs.existsSync(serverDistDir)) {
  console.error(`⚠️ Server dist directory not found: ${serverDistDir}`);
  console.log('Creating server/dist directory...');
  fs.mkdirSync(serverDistDir, { recursive: true });
}

// Create public directory in server/dist if it doesn't exist
if (!fs.existsSync(serverPublicDir)) {
  console.log(`Creating directory: ${serverPublicDir}`);
  fs.mkdirSync(serverPublicDir, { recursive: true });
}

// Copy client dist files to server public directory if client/dist exists
if (fs.existsSync(clientDistDir)) {
  console.log(`Copying client files from ${clientDistDir} to ${serverPublicDir}`);
  
  try {
    // Read all files from client/dist
    const clientFiles = fs.readdirSync(clientDistDir);
    
    // Copy each file
    clientFiles.forEach(file => {
      const srcPath = path.join(clientDistDir, file);
      const destPath = path.join(serverPublicDir, file);
      
      // Check if it's a directory
      if (fs.statSync(srcPath).isDirectory()) {
        // Create destination directory
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        
        // Copy entire directory
        copyDirectory(srcPath, destPath);
      } else {
        // Copy file
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${file}`);
      }
    });
    
    console.log('✅ Client files copied successfully');
  } catch (error) {
    console.error('Error copying client files:', error);
  }
} else {
  console.error(`❌ Client dist directory not found: ${clientDistDir}`);
  
  // Create a placeholder index.html in the public directory
  console.log('Creating placeholder index.html in public directory...');
  const placeholderHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>book-search-engine - Placeholder</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 1rem; }
    .container { background: #f5f5f5; border-radius: 8px; padding: 2rem; margin-top: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #4a25aa; }
    a { color: #4a25aa; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .btn { display: inline-block; background: #4a25aa; color: white; padding: 0.5rem 1rem; border-radius: 4px; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>book-search-engine - Book Search Engine</h1>
    <p>This is a placeholder page. The client application is not yet built.</p>
    <p>You can try the GraphQL API directly:</p>
    <a href="/graphql" class="btn">Open GraphQL Playground</a>
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(serverPublicDir, 'index.html'), placeholderHtml);
  console.log('✅ Placeholder index.html created');
}

console.log('📦 Post-build tasks completed');

// Function to recursively copy a directory
function copyDirectory(source, destination) {
  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const srcPath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      // Create destination directory
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      
      // Recursively copy subdirectory
      copyDirectory(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
  });
}