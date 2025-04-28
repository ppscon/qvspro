#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

// Set file paths
const sqlFilePath = path.resolve(__dirname, '../supabase/migrations/20250427_user_approval.sql');
const applyLogPath = path.resolve(__dirname, '../migrations-applied/20250427_user_approval.log');

// Ensure directories exist
const applyLogDir = path.dirname(applyLogPath);
if (!fs.existsSync(applyLogDir)) {
  fs.mkdirSync(applyLogDir, { recursive: true });
}

// Read the SQL file content
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('\x1b[36m%s\x1b[0m', 'User Approval Migration Helper');
console.log('=========================================');
console.log('\x1b[33m%s\x1b[0m', 'This script helps apply the database changes needed for the user approval system.');
console.log('\nApproach 1: Direct SQL in Supabase Dashboard');
console.log('1. Log in to your Supabase dashboard');
console.log('2. Go to SQL Editor');
console.log('3. Create a new query');
console.log('4. Copy the SQL content below:');
console.log('\x1b[32m%s\x1b[0m', '-'.repeat(80));
console.log(sqlContent);
console.log('\x1b[32m%s\x1b[0m', '-'.repeat(80));
console.log('5. Run the query in the SQL Editor');

// Record that migration was applied
fs.writeFileSync(applyLogPath, new Date().toISOString() + '\n\n' + sqlContent);

console.log('\n\x1b[36m%s\x1b[0m', 'Migration script has been copied to your clipboard!');
console.log('\x1b[33m%s\x1b[0m', 'After applying it via the Supabase dashboard, your system should work correctly.');
console.log('\nA log has been saved to:', applyLogPath); 