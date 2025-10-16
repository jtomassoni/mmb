#!/usr/bin/env tsx
// scripts/bootstrap.ts
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

// Directories to create
const directories = [
  'docs',
  'tests',
  'tests/e2e',
  'tests/unit',
  'scripts',
  'public/media',
  'public/uploads',
  'logs',
  'backups'
];

// Files to create with .gitkeep
const gitkeepFiles = [
  'tests/.gitkeep',
  'tests/e2e/.gitkeep', 
  'tests/unit/.gitkeep',
  'public/media/.gitkeep',
  'public/uploads/.gitkeep',
  'logs/.gitkeep',
  'backups/.gitkeep'
];

// .env.local template
const envLocalTemplate = `# Environment variables for local development
# Copy from .env.example and fill in values

# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Platform Configuration
PLATFORM_HOST="mmb-five.vercel.app"

# Vercel (optional)
VERCEL_TOKEN=""
VERCEL_PROJECT_ID=""

# Add other environment variables as needed
`;

function createDirectories() {
  console.log('Creating directories...');
  directories.forEach(dir => {
    const fullPath = path.join(projectRoot, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    } else {
      console.log(`- Directory already exists: ${dir}`);
    }
  });
}

function createGitkeepFiles() {
  console.log('Creating .gitkeep files...');
  gitkeepFiles.forEach(file => {
    const fullPath = path.join(projectRoot, file);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, '');
      console.log(`✓ Created: ${file}`);
    } else {
      console.log(`- Already exists: ${file}`);
    }
  });
}

function createEnvLocal() {
  console.log('Creating .env.local...');
  const envPath = path.join(projectRoot, '.env.local');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envLocalTemplate);
    console.log('✓ Created .env.local template');
  } else {
    console.log('- .env.local already exists');
  }
}

function main() {
  console.log('🚀 Bootstrap script starting...\n');
  
  createDirectories();
  console.log('');
  
  createGitkeepFiles();
  console.log('');
  
  createEnvLocal();
  console.log('');
  
  console.log('✅ Bootstrap complete!');
  console.log('📝 Next steps:');
  console.log('   1. Review and update .env.local with your values');
  console.log('   2. Run: npm run verify-env');
  console.log('   3. Run: npm run dev');
}

main();
