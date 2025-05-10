/**
 * This script checks if all required environment variables are set
 * before starting the application.
 */

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET_KEY'];
const missingEnvVars = [];

console.log('Checking environment variables...');

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    missingEnvVars.push(envVar);
  }
});

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\nPlease set these environment variables before starting the application.');
  console.error('You can create a .env file based on the .env.example file.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set.');
}