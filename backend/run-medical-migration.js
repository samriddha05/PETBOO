// Run the medical tables migration
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
  const sql = fs.readFileSync(path.join(__dirname, 'medical-migration.sql'), 'utf8');
  const client = await pool.connect();
  try {
    console.log('🔄 Running medical records migration...');
    await client.query(sql);
    console.log('✅ Migration complete! Tables created:');
    console.log('   - MedicalRecord');
    console.log('   - MedicalFile');
    console.log('   - Vaccination');

    // Verify tables exist
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('MedicalRecord', 'MedicalFile', 'Vaccination')
    `);
    console.log('✅ Verified tables in DB:', result.rows.map(r => r.table_name).join(', '));
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
