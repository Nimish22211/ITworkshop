const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database with sample data...');
    
    // Create sample users
    const users = [
      {
        name: 'John Citizen',
        email: 'john@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'citizen'
      },
      {
        name: 'Jane Official',
        email: 'jane@city.gov',
        password: 'password123',
        phone: '+1234567891',
        role: 'official',
        department: 'public_works'
      },
      {
        name: 'Bob Traffic',
        email: 'bob@city.gov',
        password: 'password123',
        phone: '+1234567892',
        role: 'official',
        department: 'traffic'
      },
      {
        name: 'Alice Parks',
        email: 'alice@city.gov',
        password: 'password123',
        phone: '+1234567893',
        role: 'official',
        department: 'parks'
      }
    ];

    const createdUsers = [];
    
    for (const userData of users) {
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );
      
      if (existingUser.rows.length > 0) {
        console.log(`👤 User ${userData.email} already exists, skipping...`);
        createdUsers.push(existingUser.rows[0]);
        continue;
      }
      
      const password_hash = await bcrypt.hash(userData.password, 12);
      
      const result = await pool.query(`
        INSERT INTO users (name, email, password_hash, phone, role, department)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, email, role, department
      `, [
        userData.name,
        userData.email,
        password_hash,
        userData.phone,
        userData.role,
        userData.department
      ]);
      
      createdUsers.push(result.rows[0]);
      console.log(`✅ Created user: ${userData.name} (${userData.email})`);
    }

    // Create sample issues
    const issues = [
      {
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Main St, New York, NY 10001',
        category: 'pothole',
        title: 'Large pothole on Main Street',
        description: 'There is a large pothole on Main Street that is causing damage to vehicles. It has been getting worse over the past few weeks.',
        severity: 4,
        photos: JSON.stringify([
          {
            url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
            public_id: 'sample-pothole-1',
            width: 800,
            height: 600
          }
        ]),
        reported_by: createdUsers[0].id,
        status: 'reported'
      },
      {
        latitude: 40.7138,
        longitude: -74.0070,
        address: '456 Oak Ave, New York, NY 10002',
        category: 'streetlight',
        title: 'Broken streetlight on Oak Avenue',
        description: 'The streetlight at the corner of Oak Avenue and 5th Street has been out for over a week. It makes the area very dark at night.',
        severity: 3,
        photos: JSON.stringify([
          {
            url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
            public_id: 'sample-streetlight-1',
            width: 800,
            height: 600
          }
        ]),
        reported_by: createdUsers[0].id,
        status: 'acknowledged',
        assigned_to: createdUsers[1].id
      },
      {
        latitude: 40.7148,
        longitude: -74.0080,
        address: '789 Pine St, New York, NY 10003',
        category: 'graffiti',
        title: 'Graffiti on public building',
        description: 'There is extensive graffiti on the side of the public library building. It appeared over the weekend.',
        severity: 2,
        photos: JSON.stringify([
          {
            url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800',
            public_id: 'sample-graffiti-1',
            width: 800,
            height: 600
          }
        ]),
        reported_by: createdUsers[0].id,
        status: 'in_progress',
        assigned_to: createdUsers[2].id
      },
      {
        latitude: 40.7158,
        longitude: -74.0090,
        address: '321 Elm St, New York, NY 10004',
        category: 'waste',
        title: 'Overflowing trash cans',
        description: 'The trash cans at the park are overflowing and garbage is scattered around the area.',
        severity: 3,
        photos: JSON.stringify([
          {
            url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
            public_id: 'sample-waste-1',
            width: 800,
            height: 600
          }
        ]),
        reported_by: createdUsers[0].id,
        status: 'resolved',
        assigned_to: createdUsers[1].id,
        resolved_at: new Date()
      },
      {
        latitude: 40.7168,
        longitude: -74.0100,
        address: '654 Maple Dr, New York, NY 10005',
        category: 'sewage',
        title: 'Sewage backup in basement',
        description: 'There is a sewage backup in the basement of the apartment building. The smell is very strong.',
        severity: 5,
        photos: JSON.stringify([
          {
            url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
            public_id: 'sample-sewage-1',
            width: 800,
            height: 600
          }
        ]),
        reported_by: createdUsers[0].id,
        status: 'reported'
      }
    ];

    for (const issueData of issues) {
      const result = await pool.query(`
        INSERT INTO issues (latitude, longitude, address, category, title, description, severity, photos, reported_by, assigned_to, status, resolved_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [
        issueData.latitude,
        issueData.longitude,
        issueData.address,
        issueData.category,
        issueData.title,
        issueData.description,
        issueData.severity,
        issueData.photos,
        issueData.reported_by,
        issueData.assigned_to,
        issueData.status,
        issueData.resolved_at
      ]);

      // Add status history for each issue
      await pool.query(`
        INSERT INTO status_history (issue_id, status, updated_by, notes)
        VALUES ($1, $2, $3, $4)
      `, [
        result.rows[0].id,
        issueData.status,
        issueData.reported_by,
        issueData.status === 'reported' ? 'Issue reported by citizen' : null
      ]);

      // Add additional status history for assigned issues
      if (issueData.assigned_to) {
        await pool.query(`
          INSERT INTO status_history (issue_id, status, updated_by, notes)
          VALUES ($1, $2, $3, $4)
        `, [
          result.rows[0].id,
          'acknowledged',
          issueData.assigned_to,
          'Issue assigned to official'
        ]);
      }

      if (issueData.status === 'in_progress') {
        await pool.query(`
          INSERT INTO status_history (issue_id, status, updated_by, notes)
          VALUES ($1, $2, $3, $4)
        `, [
          result.rows[0].id,
          'in_progress',
          issueData.assigned_to,
          'Work started on issue'
        ]);
      }

      if (issueData.status === 'resolved') {
        await pool.query(`
          INSERT INTO status_history (issue_id, status, updated_by, notes)
          VALUES ($1, $2, $3, $4)
        `, [
          result.rows[0].id,
          'resolved',
          issueData.assigned_to,
          'Issue resolved by official'
        ]);
      }

      console.log(`✅ Created issue: ${issueData.title}`);
    }

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Sample Data Created:');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`📋 Issues: ${issues.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@civic-platform.com / admin123');
    console.log('Citizen: john@example.com / password123');
    console.log('Official: jane@city.gov / password123');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { seedDatabase };
