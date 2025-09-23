# Civic Issues Platform - Backend

A robust Express.js backend API for the Civic Issues Platform, featuring PostgreSQL database, JWT authentication, and real-time WebSocket communication.

## 🚀 Features

- **RESTful API** with Express.js
- **PostgreSQL Database** with optimized queries
- **JWT Authentication** with role-based access
- **Real-time Updates** with Socket.IO
- **Image Upload** with Cloudinary integration
- **Rate Limiting** and security middleware
- **Comprehensive Validation** with express-validator

## 🛠 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Socket.IO** - Real-time communication
- **Cloudinary** - Image storage
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Update the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=your-super-secret-jwt-key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

3. **Initialize database:**
   ```bash
   npm run db:init
   ```

4. **Seed with sample data:**
   ```bash
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Start production server:**
   ```bash
   npm start
   ```

## 🗄️ Database Schema

### Users Table
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
```

### Issues Table
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
  photos TEXT,
  reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status issue_status DEFAULT 'reported',
  internal_notes TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Status History Table
```sql
CREATE TABLE status_history (
  id SERIAL PRIMARY KEY,
  issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
  status issue_status NOT NULL,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Authentication

### JWT Token Structure
```json
{
  "userId": 123,
  "iat": 1640995200,
  "exp": 1641600000
}
```

### Role-based Access Control
- **Citizen**: Can report issues, view public issues
- **Official**: Can manage assigned issues, update status
- **Admin**: Full access to all features, user management

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Update password

### Issues
- `GET /api/issues` - Get all issues (with filters)
- `GET /api/issues/:id` - Get issue by ID
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id/status` - Update issue status
- `PUT /api/issues/:id/assign` - Assign issue to official
- `GET /api/issues/assigned/:officialId` - Get assigned issues
- `GET /api/issues/:id/history` - Get issue history
- `GET /api/issues/analytics` - Get analytics (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/officials` - Get all officials
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/role` - Update user role (Admin only)
- `PUT /api/users/:id/deactivate` - Deactivate user (Admin only)

### Upload
- `POST /api/upload/single` - Upload single image
- `POST /api/upload/multiple` - Upload multiple images
- `POST /api/upload/issue-photos` - Upload issue photos

## 🔄 Real-time Features

### WebSocket Events
- `new-issue` - New issue reported
- `issue-updated` - Issue status updated
- `issue-assigned` - Issue assigned to official

### Socket.IO Integration
```javascript
// Client connection
const socket = io('http://localhost:5000', {
  auth: {
    token: 'jwt-token'
  }
});

// Listen for events
socket.on('new-issue', (issue) => {
  console.log('New issue:', issue);
});
```

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent abuse
- **Input Validation** - Sanitize user input
- **Password Hashing** - bcryptjs with salt rounds
- **JWT Expiration** - Token-based authentication

## 📊 Performance Optimizations

- **Connection Pooling** - PostgreSQL connection management
- **Database Indexes** - Optimized query performance
- **Compression** - gzip compression
- **Caching** - Response caching strategies

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### API Testing
```bash
# Test specific endpoint
curl -X GET http://localhost:5000/api/health
```

## 📈 Monitoring

### Health Check
- `GET /health` - Server health status
- Database connection status
- Environment information

### Logging
- **Morgan** - HTTP request logging
- **Console** - Error and info logging
- **Structured** - JSON format for production

## 🚀 Deployment

### Render.com (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-production-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🔧 Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:init` - Initialize database
- `npm run db:seed` - Seed database with sample data
- `npm test` - Run tests

### Database Management
```bash
# Initialize database
npm run db:init

# Seed with sample data
npm run db:seed

# Connect to database (if using psql)
psql $DATABASE_URL
```

## 📁 Project Structure

```
backend/
├── models/              # Database models
├── routes/              # API routes
├── middleware/          # Custom middleware
├── services/            # External services
├── scripts/             # Database scripts
├── server.js          # Main server file
└── package.json        # Dependencies
```

## 🔗 External Services

### Cloudinary Integration
- **Image upload** and optimization
- **Automatic format** conversion (WebP)
- **Responsive images** with transformations
- **Secure upload** with presets

### PostgreSQL Features
- **JSON storage** for photos
- **Geospatial queries** (ready for PostGIS)
- **Full-text search** capabilities
- **Transaction support**

## 📝 API Documentation

### Request/Response Examples

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "citizen"
  }'
```

#### Create Issue
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt-token" \
  -d '{
    "title": "Pothole on Main Street",
    "description": "Large pothole causing damage to vehicles",
    "category": "pothole",
    "severity": 4,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, New York, NY"
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.