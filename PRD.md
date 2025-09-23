# Civic Issue Reporting Platform - Product Requirements Document
*1-Day Hackathon Project*

## 🎯 Executive Summary

**Vision**: Create a citizen-centric platform for reporting and tracking municipal issues (potholes, broken streetlights, graffiti, etc.) with real-time mapping and community engagement.

**Goal**: Win hackathon by delivering a polished, functional civic engagement tool that demonstrates technical excellence and social impact.

**Tech Stack**: React (Frontend) + Express.js (Backend) + Leaflet Maps + PostgreSQL (Render) + Cloudinary

---

## 🏆 Win Conditions & Hackathon Strategy

### Primary Differentiators (Problem + Scalability Focus)
1. **Real-time collaborative mapping** - solves information silos between citizens and government
2. **Automated prioritization algorithm** - solves resource allocation inefficiency
3. **Multi-jurisdictional architecture** - designed for city-wide, then state-wide scalability
4. **Cost-effective solution** - reduces municipal helpdesk costs by 70%
5. **Data-driven insights** - transforms reactive governance to proactive infrastructure management

### Team Distribution (4 developers)
- **Frontend Team (2)**: React components, Leaflet integration, responsive UI
- **Backend Team (2)**: Express.js APIs, Socket.io real-time features, PostgreSQL database design

### Demo Flow (5-minute presentation)
1. **Problem Statement** - Show inefficiency of current 311 systems (30s)
2. **Citizen Journey** - Report pothole via mobile with real-time map update (60s)
3. **Government Dashboard** - Official receives notification, updates status, automated workflows (60s)
4. **Scalability Showcase** - Multi-city architecture, cost savings analytics (45s)
5. **Technical Excellence** - Real-time WebSocket, mobile-responsive, Render deployment (45s)
6. **Future Vision** - Integration with existing municipal systems, AI predictions (30s)

---

## 🎯 Core Features (MVP)

### 1. Issue Reporting System
**Priority: CRITICAL**
- **Location selection**: "Use My Location" button OR click on map to select coordinates
- **Photo upload** with Cloudinary integration (multiple photos per issue)
- **Issue categorization** (dropdown: Potholes, Street Lighting, Graffiti, Waste, Sewage, Roads, Other)
- **Description** and severity rating (1-5)
- **Contact information** (optional for follow-up)
- **Auto-timestamp** with submission time

### 2. Interactive Map Interface  
**Priority: CRITICAL**
- **Leaflet.js integration** with OpenStreetMap
- **Dual location input**: GPS button for current location OR click-to-select on map
- **Issue markers** color-coded by status (Red: Reported, Yellow: In Progress, Green: Resolved)
- **Real-time updates** when officials update status
- **Filter by category, status, and date range**
- **Issue clustering** for dense areas
- **Popup details** on marker click showing photos and description

### 3. Role-Based Access Control
**Priority: CRITICAL**
- **Citizens**: Can report issues, view all public issues, track their submissions
- **Officials**: Can view assigned issues, update status, add internal notes, mark as resolved
- **Admins**: Full access to all issues, user management, assign issues to officials, analytics dashboard
- **Department-specific access**: Officials only see issues in their jurisdiction (e.g., Public Works, Traffic, Parks)

### 4. Official Dashboard & Issue Management
**Priority: HIGH**
- **Issue assignment system**: Admins assign issues to specific officials/departments
- **Status update workflow**: Reported → Acknowledged → In Progress → Resolved → Verified
- **Internal notes system** for officials (not visible to citizens)
- **Priority scoring** and sorting (by severity, age, location)
- **Photo gallery view** for each issue
- **Contact citizen** feature for clarification
- **Before/After photos** for resolved issues

### 5. Admin Analytics & Reporting
**Priority: MEDIUM**
- **Dashboard metrics**: Total issues, resolution rates, average response time
- **Geographic insights**: Hotspot analysis, ward-wise distribution
- **Department performance**: Individual official tracking
- **Export reports** for municipal records
- **Issue trend analysis** over time

---

## 🛠 Technical Architecture

### Frontend (React)
```
src/
├── components/
│   ├── Map/
│   │   ├── IssueMap.jsx
│   │   ├── IssueMarker.jsx
│   │   └── MapControls.jsx
│   ├── Forms/
│   │   ├── ReportIssueForm.jsx
│   │   └── IssueFilters.jsx
│   ├── Dashboard/
│   │   ├── AdminDashboard.jsx
│   │   ├── Analytics.jsx
│   │   └── IssueManagement.jsx
│   └── Common/
│       ├── Header.jsx
│       ├── IssueCard.jsx
│       └── LoadingSpinner.jsx
├── services/
│   ├── apiService.js
│   ├── mapService.js
│   └── authService.js
├── hooks/
│   ├── useGeolocation.js
│   ├── useWebSocket.js
│   └── useIssues.js
└── utils/
    ├── constants.js
    └── helpers.js
```

## 💻 Backend Code Structure

### Server Setup (server.js)
```javascript
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');

// Route imports
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

dotenv.config();
const app = express();

// PostgreSQL connection pool (Render PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pool settings for production
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.connect()
  .then(client => {
    console.log('✅ Connected to Render PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.stack);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Make database pool accessible to routes
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: Render PostgreSQL`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('⏳ Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});
```

### Database Models & Queries (models/Issue.js)
```javascript
class Issue {
  constructor(pool) {
    this.pool = pool;
  }

  async create(issueData) {
    const {
      latitude, longitude, address, category, title, 
      description, severity, photos, reported_by
    } = issueData;

    const query = `
      INSERT INTO issues (latitude, longitude, address, category, title, description, severity, photos, reported_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      parseFloat(latitude), 
      parseFloat(longitude), 
      address, 
      category, 
      title, 
      description, 
      parseInt(severity), 
      JSON.stringify(photos), 
      reported_by
    ];
    
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      const result = await client.query(query, values);
      
      // Add to status history
      await this.addStatusHistory(result.rows[0].id, 'reported', reported_by, null, client);
      
      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findAll(filters = {}) {
    let query = `
      SELECT i.*, 
             u1.name as reported_by_name, u1.email as reported_by_email,
             u2.name as assigned_to_name, u2.email as assigned_to_email, u2.department
      FROM issues i
      LEFT JOIN users u1 ON i.reported_by = u1.id
      LEFT JOIN users u2 ON i.assigned_to = u2.id
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 0;

    if (filters.category && filters.category !== 'all') {
      paramCount++;
      query += ` AND i.category = $${paramCount}`;
      values.push(filters.category);
    }
    
    if (filters.status && filters.status !== 'all') {
      paramCount++;
      query += ` AND i.status = $${paramCount}`;
      values.push(filters.status);
    }
    
    if (filters.severity) {
      paramCount++;
      query += ` AND i.severity >= $${paramCount}`;
      values.push(parseInt(filters.severity));
    }

    if (filters.assigned_to) {
      paramCount++;
      query += ` AND i.assigned_to = $${paramCount}`;
      values.push(parseInt(filters.assigned_to));
    }

    query += ` ORDER BY i.created_at DESC LIMIT 1000`;

    const result = await this.pool.query(query, values);
    
    // Parse photos JSON for each issue
    return result.rows.map(issue => ({
      ...issue,
      photos: typeof issue.photos === 'string' ? JSON.parse(issue.photos) : issue.photos
    }));
  }

  async findById(id) {
    const query = `
      SELECT i.*, 
             u1.name as reported_by_name, u1.email as reported_by_email, u1.phone as reported_by_phone,
             u2.name as assigned_to_name, u2.email as assigned_to_email, u2.department
      FROM issues i
      LEFT JOIN users u1 ON i.reported_by = u1.id
      LEFT JOIN users u2 ON i.assigned_to = u2.id
      WHERE i.id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    if (result.rows[0]) {
      result.rows[0].photos = typeof result.rows[0].photos === 'string' 
        ? JSON.parse(result.rows[0].photos) 
        : result.rows[0].photos;
    }
    return result.rows[0];
  }

  async updateStatus(id, status, updatedBy, internalNotes = null) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update issue
      let query = `UPDATE issues SET status = $1, updated_at = CURRENT_TIMESTAMP`;
      let values = [status];
      let paramCount = 1;
      
      if (internalNotes) {
        paramCount++;
        query += `, internal_notes = $${paramCount}`;
        values.push(internalNotes);
      }
      
      if (status === 'resolved') {
        query += `, resolved_at = CURRENT_TIMESTAMP`;
      }
      
      paramCount++;
      query += ` WHERE id = $${paramCount} RETURNING *`;
      values.push(parseInt(id));
      
      const result = await client.query(query, values);
      
      // Add to status history
      await this.addStatusHistory(id, status, updatedBy, internalNotes, client);
      
      await client.query('COMMIT');
      
      // Parse photos for return
      if (result.rows[0]) {
        result.rows[0].photos = typeof result.rows[0].photos === 'string' 
          ? JSON.parse(result.rows[0].photos) 
          : result.rows[0].photos;
      }
      
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async assignToOfficial(id, officialId, assignedBy) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const query = `
        UPDATE issues 
        SET assigned_to = $1, status = 'acknowledged', updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 
        RETURNING *
      `;
      
      const result = await client.query(query, [parseInt(officialId), parseInt(id)]);
      
      // Add to status history
      await this.addStatusHistory(id, 'acknowledged', assignedBy, `Assigned to official ID: ${officialId}`, client);
      
      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findByAssignedOfficial(officialId) {
    const query = `
      SELECT i.*, 
             u.name as reported_by_name, u.email as reported_by_email, u.phone as reported_by_phone
      FROM issues i
      LEFT JOIN users u ON i.reported_by = u.id
      WHERE i.assigned_to = $1
      ORDER BY 
        CASE i.status 
          WHEN 'acknowledged' THEN 1
          WHEN 'in_progress' THEN 2
          WHEN 'resolved' THEN 3
          WHEN 'verified' THEN 4
          ELSE 5
        END,
        i.severity DESC,
        i.created_at ASC
    `;
    
    const result = await this.pool.query(query, [parseInt(officialId)]);
    
    // Parse photos for each issue
    return result.rows.map(issue => ({
      ...issue,
      photos: typeof issue.photos === 'string' ? JSON.parse(issue.photos) : issue.photos
    }));
  }

  async addStatusHistory(issueId, status, updatedBy, notes = null, client = null) {
    const db = client || this.pool;
    const query = `
      INSERT INTO status_history (issue_id, status, updated_by, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      parseInt(issueId), 
      status, 
      parseInt(updatedBy), 
      notes
    ]);
    return result.rows[0];
  }

  async getStatusHistory(issueId) {
    const query = `
      SELECT sh.*, u.name as updated_by_name, u.role
      FROM status_history sh
      LEFT JOIN users u ON sh.updated_by = u.id
      WHERE sh.issue_id = $1
      ORDER BY sh.created_at ASC
    `;
    
    const result = await this.pool.query(query, [parseInt(issueId)]);
    return result.rows;
  }

  async getAnalytics() {
    const queries = {
      totalIssues: 'SELECT COUNT(*) as count FROM issues',
      resolvedIssues: 'SELECT COUNT(*) as count FROM issues WHERE status = $1',
      avgResolutionTime: `
        SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_hours
        FROM issues 
        WHERE status = 'resolved' AND resolved_at IS NOT NULL
      `,
      issuesByCategory: `
        SELECT category, COUNT(*) as count 
        FROM issues 
        GROUP BY category 
        ORDER BY count DESC
      `,
      issuesByStatus: `
        SELECT status, COUNT(*) as count 
        FROM issues 
        GROUP BY status 
        ORDER BY 
          CASE status 
            WHEN 'reported' THEN 1
            WHEN 'acknowledged' THEN 2
            WHEN 'in_progress' THEN 3
            WHEN 'resolved' THEN 4
            WHEN 'verified' THEN 5
          END
      `
    };

    const results = {};
    
    for (const [key, query] of Object.entries(queries)) {
      try {
        if (key === 'resolvedIssues') {
          const result = await this.pool.query(query, ['resolved']);
          results[key] = parseInt(result.rows[0].count);
        } else {
          const result = await this.pool.query(query);
          results[key] = key.includes('By') ? result.rows : 
                       key === 'avgResolutionTime' ? parseFloat(result.rows[0].avg_hours) || 0 :
                       parseInt(result.rows[0].count);
        }
      } catch (error) {
        console.error(`Error fetching ${key}:`, error);
        results[key] = key.includes('By') ? [] : 0;
      }
    }

    return results;
  }
}

module.exports = Issue;
```

### User Model (models/User.js)
```javascript
const bcrypt = require('bcryptjs');

class User {
  constructor(pool) {
    this.pool = pool;
  }

  async create(userData) {
    const { name, email, password, phone, role = 'citizen', department } = userData;
    
    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (name, email, password_hash, phone, role, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, phone, role, department, is_active, created_at
    `;
    
    const values = [name, email, password_hash, phone, role, department];
    const result = await this.pool.query(query, values);
    
    return result.rows[0];
  }

  async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1 AND is_active = true`;
    const result = await this.pool.query(query, [email.toLowerCase()]);
    return result.rows[0];
  }

  async findById(id) {
    const query = `
      SELECT id, name, email, phone, role, department, is_active, created_at
      FROM users WHERE id = $1 AND is_active = true
    `;
    const result = await this.pool.query(query, [parseInt(id)]);
    return result.rows[0];
  }

  async findOfficials() {
    const query = `
      SELECT id, name, email, department, role
      FROM users 
      WHERE role IN ('official', 'admin') AND is_active = true
      ORDER BY department, name
    `;
    const result = await this.pool.query(query);
    return result.rows;
  }

  async findAll(filters = {}) {
    let query = `
      SELECT id, name, email, phone, role, department, is_active, created_at
      FROM users 
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (filters.role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      values.push(filters.role);
    }

    if (filters.department) {
      paramCount++;
      query += ` AND department = $${paramCount}`;
      values.push(filters.department);
    }

    if (filters.is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.pool.query(query, values);
    return result.rows;
  }

  async updateRole(id, role, department = null) {
    const query = `
      UPDATE users 
      SET role = $1, department = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND is_active = true
      RETURNING id, name, email, phone, role, department, is_active, created_at
    `;
    
    const result = await this.pool.query(query, [role, department, parseInt(id)]);
    return result.rows[0];
  }

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updatePassword(id, newPassword) {
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const query = `
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND is_active = true
    `;
    
    await this.pool.query(query, [password_hash, parseInt(id)]);
    return true;
  }
}

module.exports = User;
```

### JWT Authentication Middleware (middleware/auth.js)
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userModel = new User(req.db);
    const user = await userModel.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${userRoles.join(' or ')}, your role: ${req.user.role}` 
      });
    }

    next();
  };
};

module.exports = { auth, requireRole };
```

### Cloudinary Upload Service (services/cloudinaryService.js)
```javascript
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Max 5 files per upload
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const uploadToCloudinary = (buffer, folder = 'civic-issues') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: folder,
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto', format: 'webp' }
        ],
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height
          });
        }
      }
    ).end(buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };
```

## 📊 Data Strategy & Requirements

### Core Data Models

**1. Users Table**
```sql
CREATE TABLE users (
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

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_active ON users(is_active);

-- Enums
CREATE TYPE user_role AS ENUM ('citizen', 'official', 'admin');
CREATE TYPE department_type AS ENUM ('public_works', 'traffic', 'parks', 'sewage', 'maintenance');
```

**2. Issues Table**
```sql
CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  category issue_category NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity INTEGER CHECK (severity BETWEEN 1 AND 5) DEFAULT 3,
  photos TEXT, -- JSON string of photo URLs
  reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status issue_status DEFAULT 'reported',
  internal_notes TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_issues_location ON issues(latitude, longitude);
CREATE INDEX idx_issues_category ON issues(category);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_reported_by ON issues(reported_by);
CREATE INDEX idx_issues_assigned_to ON issues(assigned_to);
CREATE INDEX idx_issues_created_at ON issues(created_at);
CREATE INDEX idx_issues_severity ON issues(severity);

-- Composite index for common queries
CREATE INDEX idx_issues_status_created ON issues(status, created_at);
CREATE INDEX idx_issues_category_status ON issues(category, status);

-- Enums
CREATE TYPE issue_category AS ENUM ('pothole', 'streetlight', 'graffiti', 'waste', 'sewage', 'road', 'other');
CREATE TYPE issue_status AS ENUM ('reported', 'acknowledged', 'in_progress', 'resolved', 'verified');
```

**3. Status History Table**
```sql
CREATE TABLE status_history (
  id SERIAL PRIMARY KEY,
  issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
  status issue_status NOT NULL,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_status_history_issue_id ON status_history(issue_id);
CREATE INDEX idx_status_history_updated_by ON status_history(updated_by);
CREATE INDEX idx_status_history_created_at ON status_history(created_at);
```

### Database Initialization Script (db/init.sql)
```sql
-- Enable PostGIS extension for advanced geospatial queries (optional)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Create enums first
CREATE TYPE user_role AS ENUM ('citizen', 'official', 'admin');
CREATE TYPE department_type AS ENUM ('public_works', 'traffic', 'parks', 'sewage', 'maintenance');
CREATE TYPE issue_category AS ENUM ('pothole', 'streetlight', 'graffiti', 'waste', 'sewage', 'road', 'other');
CREATE TYPE issue_status AS ENUM ('reported', 'acknowledged', 'in_progress', 'resolved', 'verified');

-- Create tables
-- [Include all table creation scripts from above]

-- Insert default admin user (password: 'admin123' - change in production!)
INSERT INTO users (name, email, password_hash, role) VALUES (
  'System Admin',
  'admin@civic-platform.com',
  '$2a$12$8Hqn9pJK7s2QzXNJHxK7J.YL2FhGgIqAzDCdR3rKm1QsP7vKp5BcK',
  'admin'
);
```

### Manual Data Upload Process
- **SQL interface** via Render PostgreSQL dashboard for bulk operations
- **Admin panel** CSV upload functionality 
- **REST API endpoints** for programmatic data insertion
- **Map interface** for admins to click and create test issues with exact coordinates

---