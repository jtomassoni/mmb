#!/usr/bin/env tsx
// scripts/verify-env.ts
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const envPath = path.join(projectRoot, '.env.local');

// Required environment variables
const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL', 
  'NEXTAUTH_SECRET',
  'PLATFORM_HOST'
];

// Optional environment variables (with helpful messages)
const optionalVars = [
  { name: 'VERCEL_TOKEN', message: 'Vercel integration will be disabled' },
  { name: 'VERCEL_PROJECT_ID', message: 'Vercel integration will be disabled' }
];

function checkEnvFile() {
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    console.log('💡 Run: npm run bootstrap');
    process.exit(1);
  }
  console.log('✓ .env.local file exists');
}

function loadEnvVars() {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars: Record<string, string> = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
  
  return envVars;
}

function checkRequiredVars(envVars: Record<string, string>) {
  console.log('\n🔍 Checking required environment variables...');
  let allRequired = true;
  
  requiredVars.forEach(varName => {
    const value = envVars[varName];
    if (!value || value === 'your-secret-key-here' || value === '') {
      console.error(`❌ ${varName} is missing or not configured`);
      allRequired = false;
    } else {
      console.log(`✓ ${varName} is configured`);
    }
  });
  
  return allRequired;
}

function checkOptionalVars(envVars: Record<string, string>) {
  console.log('\n🔍 Checking optional environment variables...');
  
  optionalVars.forEach(({ name, message }) => {
    const value = envVars[name];
    if (!value || value === '') {
      console.log(`⚠️  ${name} is not set - ${message}`);
    } else {
      console.log(`✓ ${name} is configured`);
    }
  });
}

function checkDatabaseFile() {
  const dbPath = path.join(projectRoot, 'prisma/dev.db');
  if (!fs.existsSync(dbPath)) {
    console.log('\n📊 Database file not found, you may need to run:');
    console.log('   npx prisma migrate dev');
  } else {
    console.log('\n✓ Database file exists');
  }
}

function main() {
  console.log('🔧 Environment verification starting...\n');
  
  checkEnvFile();
  
  const envVars = loadEnvVars();
  
  const requiredOk = checkRequiredVars(envVars);
  checkOptionalVars(envVars);
  checkDatabaseFile();
  
  console.log('\n' + '='.repeat(50));
  
  if (requiredOk) {
    console.log('✅ All required environment variables are configured!');
    console.log('🚀 Ready to run: npm run dev');
  } else {
    console.log('❌ Some required environment variables are missing.');
    console.log('📝 Please update .env.local and run this script again.');
    process.exit(1);
  }
}

main();
