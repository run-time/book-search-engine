import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get project root directory (up one level from scripts folder)
const projectRoot = path.resolve(__dirname, '..');

console.log('🔍 Checking paths for deployment...');
console.log(`📂 Current working directory: ${process.cwd()}`);
console.log(`📂 Project root: ${projectRoot}`);

// Check server directory
const serverDir = path.join(projectRoot, 'server');
const serverDistDir = path.join(serverDir, 'dist');
const serverDistExists = fs.existsSync(serverDistDir);

console.log(`\n📁 Server Directory (${serverDir}):`);
console.log(`   - Exists: ${fs.existsSync(serverDir)}`);
if (fs.existsSync(serverDir)) {
  console.log(`   - Contents: ${fs.readdirSync(serverDir).join(', ')}`);
}

console.log(`\n📁 Server Dist Directory (${serverDistDir}):`);
console.log(`   - Exists: ${serverDistExists}`);
if (serverDistExists) {
  console.log(`   - Contents: ${fs.readdirSync(serverDistDir).join(', ')}`);
}

// Check client directory
const clientDir = path.join(projectRoot, 'client');
const clientDistDir = path.join(clientDir, 'dist');
const clientDistExists = fs.existsSync(clientDistDir);

console.log(`\n📁 Client Directory (${clientDir}):`);
console.log(`   - Exists: ${fs.existsSync(clientDir)}`);
if (fs.existsSync(clientDir)) {
  console.log(`   - Contents: ${fs.readdirSync(clientDir).join(', ')}`);
}

console.log(`\n📁 Client Dist Directory (${clientDistDir}):`);
console.log(`   - Exists: ${clientDistExists}`);
if (clientDistExists) {
  console.log(`   - Contents: ${fs.readdirSync(clientDistDir).join(', ')}`);
}

// Check server entry point
const serverEntryPoint = path.join(serverDistDir, 'server.js');
console.log(`\n📄 Server Entry Point (${serverEntryPoint}):`);
console.log(`   - Exists: ${fs.existsSync(serverEntryPoint)}`);

// Check client HTML
const clientHtmlFile = path.join(clientDistDir, 'index.html');
console.log(`\n📄 Client HTML (${clientHtmlFile}):`);
console.log(`   - Exists: ${fs.existsSync(clientHtmlFile)}`);

// Check paths from server perspective
const serverClientPath = path.resolve(serverDistDir, '../../client/dist');
console.log(`\n📂 Path from server dist to client dist (${serverClientPath}):`);
console.log(`   - Exists: ${fs.existsSync(serverClientPath)}`);
if (fs.existsSync(serverClientPath)) {
  console.log(`   - Contents: ${fs.readdirSync(serverClientPath).join(', ')}`);
  
  const serverClientHtml = path.join(serverClientPath, 'index.html');
  console.log(`   - index.html exists: ${fs.existsSync(serverClientHtml)}`);
}

console.log('\n✅ Path check complete');