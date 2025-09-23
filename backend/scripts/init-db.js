const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const initDatabase = async () => {
  try {
    console.log('🗄️  Initializing database...');
    
    // Create enums
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('citizen', 'official', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE department_type AS ENUM ('public_works', 'traffic', 'parks', 'sewage', 'maintenance');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE issue_category AS ENUM ('pothole', 'streetlight', 'graffiti', 'waste', 'sewage', 'road', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE issue_status AS ENUM ('reported', 'acknowledged', 'in_progress', 'resolved', 'verified');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role user_role DEFAULT 'citizen',
        department department_type,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create issues table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        address TEXT,
        category issue_category NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        severity INTEGER CHECK (severity BETWEEN 1 AND 5) DEFAULT 3,
        photos TEXT,
        reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        status issue_status DEFAULT 'reported',
        internal_notes TEXT,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create status_history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS status_history (
        id SERIAL PRIMARY KEY,
        issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
        status issue_status NOT NULL,
        updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_location ON issues(latitude, longitude);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_reported_by ON issues(reported_by);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON issues(assigned_to);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_severity ON issues(severity);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_status_created ON issues(status, created_at);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_issues_category_status ON issues(category, status);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_status_history_issue_id ON status_history(issue_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_status_history_updated_by ON status_history(updated_by);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_status_history_created_at ON status_history(created_at);
    `);

    console.log('✅ Database initialized successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

const createDefaultAdmin = async () => {
  try {
    console.log('👤 Creating default admin user...');
    
    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@civic-platform.com']
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Create default admin user (password: 'admin123')
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash('admin123', 12);
    
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role, department)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      'System Admin',
      'admin@civic-platform.com',
      password_hash,
      'admin',
      'public_works'
    ]);
    
    console.log('✅ Default admin user created');
    console.log('📧 Email: admin@civic-platform.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Failed to create default admin:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await initDatabase();
    await createDefaultAdmin();
    console.log('🎉 Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { initDatabase, createDefaultAdmin };
