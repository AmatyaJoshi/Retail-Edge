import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('=== ENVIRONMENT VARIABLES CHECK ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_DATABASE_URL:', process.env.SUPABASE_DATABASE_URL ? 'SET' : 'NOT SET');

if (process.env.DATABASE_URL) {
  console.log('\nDATABASE_URL preview:', process.env.DATABASE_URL.substring(0, 50) + '...');
}

if (process.env.SUPABASE_DATABASE_URL) {
  console.log('SUPABASE_DATABASE_URL preview:', process.env.SUPABASE_DATABASE_URL.substring(0, 50) + '...');
}

console.log('\nAll environment variables:');
Object.keys(process.env).forEach(key => {
  if (key.includes('DATABASE') || key.includes('DB')) {
    console.log(`${key}: ${process.env[key] ? 'SET' : 'NOT SET'}`);
  }
}); 