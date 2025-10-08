import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env.local');

if (!existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

config({ path: envPath });

const requiredEnvVars = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GEMINI_API_KEY',  // Changed from OPENAI_API_KEY
  'ENCRYPTION_KEY',
];

const missingVars: string[] = [];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease add these to your .env.local file');
  process.exit(1);
}

console.log('✅ All required environment variables are set');
console.log('✅ Using Google Gemini AI');