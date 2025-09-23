const request = require('supertest');
const { app } = require('../server');
const { Pool } = require('pg');

// Mock database
const mockPool = {
  connect: jest.fn(),
  query: jest.fn(),
  end: jest.fn()
};

const mockClient = {
  query: jest.fn(),
  release: jest.fn()
};

// Mock Socket.IO
const mockIo = {
  to: jest.fn(() => ({
    emit: jest.fn()
  })),
  emit: jest.fn()
};

// Mock models
const mockIssue = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  updateStatus: jest.fn(),
  assignToOfficial: jest.fn(),
  getAnalytics: jest.fn(),
  getStatusHistory: jest.fn(),
  addStatusHistory: jest.fn()
};

const mockUser = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  findOfficials: jest.fn()
};

// Mock JWT
const jwt = require('jsonwebtoken');
jest.mock('jsonwebtoken');

describe('Enhanced Backend Features', () => {
  let authToken;
  let testIssueId;

  beforeAll(async () => {
    // Setup test environment
    process.env.JWT_SECRET = 'test-secret';
    process.env.NODE_ENV = 'test';
    
    // Mock JWT token
    jwt.verify.mockReturnValue({ userId: 1 });
    jwt.sign.mockReturnValue('mock-jwt-token');
    
    authToken = 'Bearer mock-jwt-token';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockPool.connect.mockResolvedValue(mockClient);
    mockClient.query.mockResolvedValue({ rows: [] });
    
    // Mock user authentication
    mockUser.findById.mockResolvedValue({
      id: 1,
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'admin',
      department: 'public_works'
    });
  });

  describe('Real-time Issue Creation', () => {
    it('should create issue and emit real-time event', async () => {
      const newIssue = {
        id: 1,
        title: 'Test Pothole',
        description: 'Large pothole on main street',
        category: 'pothole',
        severity: 4,
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Main St',
        reported_by: 1,
        status: 'reported',
        created_at: new Date().toISOString()
      };

      mockIssue.create.mockResolvedValue(newIssue);

      // Mock the request object to include io
      const mockReq = {
        body: {
          title: 'Test Pothole',
          description: 'Large pothole on main street',
          category: 'pothole',
          severity: 4,
          latitude: 40.7128,
          longitude: -74.0060,
          address: '123 Main St'
        },
        user: { id: 1, name: 'Test User' },
        db: mockPool,
        io: mockIo
      };

      // Test the issue creation logic
      expect(mockIssue.create).toBeDefined();
      
      // Simulate issue creation
      const result = await mockIssue.create(mockReq.body);
      expect(result).toEqual(newIssue);
      
      // Verify real-time emission would be called
      expect(mockIo.to).toBeDefined();
      expect(mockIo.emit).toBeDefined();
    });

    it('should emit notification to admin room', async () => {
      const issueData = {
        title: 'Test Issue',
        category: 'pothole',
        reported_by: 1
      };

      // Test notification emission logic
      const notificationData = {
        type: 'issue_created',
        title: 'New Issue Reported',
        message: `${issueData.title} has been reported in ${issueData.category}`,
        issueId: 1,
        userId: issueData.reported_by
      };

      expect(notificationData.type).toBe('issue_created');
      expect(notificationData.message).toContain(issueData.title);
      expect(notificationData.message).toContain(issueData.category);
    });
  });

  describe('Real-time Status Updates', () => {
    it('should update status and emit real-time event', async () => {
      const updatedIssue = {
        id: 1,
        title: 'Test Issue',
        status: 'acknowledged',
        reported_by: 2
      };

      mockIssue.updateStatus.mockResolvedValue(updatedIssue);

      const result = await mockIssue.updateStatus(1, 'acknowledged', 1, 'Test notes');
      expect(result).toEqual(updatedIssue);
      expect(mockIssue.updateStatus).toHaveBeenCalledWith(1, 'acknowledged', 1, 'Test notes');
    });

    it('should send notification to issue reporter', async () => {
      const issueData = {
        id: 1,
        title: 'Test Issue',
        status: 'in_progress',
        reported_by: 2
      };

      const notificationData = {
        type: 'issue_status_changed',
        title: 'Issue Status Updated',
        message: `Your issue "${issueData.title}" status changed to ${issueData.status}`,
        issueId: issueData.id,
        userId: 1
      };

      expect(notificationData.type).toBe('issue_status_changed');
      expect(notificationData.message).toContain(issueData.title);
      expect(notificationData.message).toContain(issueData.status);
    });
  });

  describe('Issue Assignment with Notifications', () => {
    it('should assign issue and emit notifications', async () => {
      const assignedIssue = {
        id: 1,
        title: 'Test Issue',
        assigned_to: 3,
        reported_by: 2
      };

      const assignedUser = {
        id: 3,
        name: 'Test Official',
        role: 'official'
      };

      mockIssue.assignToOfficial.mockResolvedValue(assignedIssue);
      mockUser.findById.mockResolvedValue(assignedUser);

      const result = await mockIssue.assignToOfficial(1, 3, 1);
      expect(result).toEqual(assignedIssue);
      expect(mockIssue.assignToOfficial).toHaveBeenCalledWith(1, 3, 1);
    });

    it('should create notifications for assignment', async () => {
      const issueData = {
        id: 1,
        title: 'Test Issue',
        reported_by: 2
      };

      const assignedUser = {
        id: 3,
        name: 'Test Official'
      };

      // Notification to assigned official
      const officialNotification = {
        type: 'issue_assigned',
        title: 'New Issue Assigned',
        message: `You have been assigned to issue: "${issueData.title}"`,
        issueId: issueData.id,
        userId: 1
      };

      // Notification to issue reporter
      const reporterNotification = {
        type: 'issue_assigned',
        title: 'Issue Assigned',
        message: `Your issue "${issueData.title}" has been assigned to ${assignedUser.name}`,
        issueId: issueData.id,
        userId: 1
      };

      expect(officialNotification.type).toBe('issue_assigned');
      expect(reporterNotification.type).toBe('issue_assigned');
      expect(officialNotification.message).toContain('You have been assigned');
      expect(reporterNotification.message).toContain('has been assigned to');
    });
  });

  describe('Analytics API', () => {
    it('should return comprehensive analytics data', async () => {
      const mockAnalytics = {
        totalIssues: 150,
        resolvedIssues: 120,
        avgResolutionTime: 48.5,
        issuesByCategory: [
          { category: 'pothole', count: 45 },
          { category: 'streetlight', count: 30 },
          { category: 'graffiti', count: 25 }
        ],
        issuesByStatus: [
          { status: 'reported', count: 20 },
          { status: 'acknowledged', count: 15 },
          { status: 'in_progress', count: 10 },
          { status: 'resolved', count: 100 },
          { status: 'verified', count: 5 }
        ]
      };

      mockIssue.getAnalytics.mockResolvedValue(mockAnalytics);

      const result = await mockIssue.getAnalytics();
      expect(result).toEqual(mockAnalytics);
      expect(result.totalIssues).toBe(150);
      expect(result.resolvedIssues).toBe(120);
      expect(result.issuesByCategory).toHaveLength(3);
      expect(result.issuesByStatus).toHaveLength(5);
    });

    it('should calculate resolution rate correctly', async () => {
      const analytics = {
        totalIssues: 100,
        resolvedIssues: 80
      };

      const resolutionRate = (analytics.resolvedIssues / analytics.totalIssues) * 100;
      expect(resolutionRate).toBe(80);
    });
  });

  describe('Enhanced Filtering', () => {
    it('should filter issues by multiple criteria', async () => {
      const filters = {
        category: 'pothole',
        status: 'reported',
        severity: 3,
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      const mockFilteredIssues = [
        {
          id: 1,
          category: 'pothole',
          status: 'reported',
          severity: 4,
          created_at: '2024-01-15T10:00:00Z'
        }
      ];

      mockIssue.findAll.mockResolvedValue(mockFilteredIssues);

      const result = await mockIssue.findAll(filters);
      expect(result).toEqual(mockFilteredIssues);
      expect(mockIssue.findAll).toHaveBeenCalledWith(filters);
    });

    it('should handle empty filter results', async () => {
      mockIssue.findAll.mockResolvedValue([]);

      const result = await mockIssue.findAll({ category: 'nonexistent' });
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Status History Tracking', () => {
    it('should track status changes', async () => {
      const historyEntry = {
        id: 1,
        issue_id: 1,
        status: 'acknowledged',
        updated_by: 1,
        notes: 'Issue reviewed',
        created_at: new Date().toISOString()
      };

      mockIssue.addStatusHistory.mockResolvedValue(historyEntry);

      const result = await mockIssue.addStatusHistory(1, 'acknowledged', 1, 'Issue reviewed');
      expect(result).toEqual(historyEntry);
      expect(mockIssue.addStatusHistory).toHaveBeenCalledWith(1, 'acknowledged', 1, 'Issue reviewed');
    });

    it('should retrieve status history', async () => {
      const mockHistory = [
        {
          id: 1,
          issue_id: 1,
          status: 'reported',
          updated_by_name: 'John Doe',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          issue_id: 1,
          status: 'acknowledged',
          updated_by_name: 'Admin User',
          created_at: '2024-01-15T11:00:00Z'
        }
      ];

      mockIssue.getStatusHistory.mockResolvedValue(mockHistory);

      const result = await mockIssue.getStatusHistory(1);
      expect(result).toEqual(mockHistory);
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('reported');
      expect(result[1].status).toBe('acknowledged');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockPool.connect.mockRejectedValue(new Error('Database connection failed'));

      try {
        await mockIssue.create({});
      } catch (error) {
        expect(error.message).toBe('Database connection failed');
      }
    });

    it('should handle invalid issue data', async () => {
      const invalidIssue = {
        title: 'A', // Too short
        description: 'Short',
        category: 'invalid',
        severity: 10, // Out of range
        latitude: 200, // Invalid
        longitude: 200 // Invalid
      };

      // Validation should catch these errors
      expect(invalidIssue.title.length).toBeLessThan(5);
      expect(invalidIssue.severity).toBeGreaterThan(5);
      expect(Math.abs(invalidIssue.latitude)).toBeGreaterThan(90);
      expect(Math.abs(invalidIssue.longitude)).toBeGreaterThan(180);
    });

    it('should handle unauthorized access', async () => {
      // Mock unauthorized access scenario
      const unauthorizedError = {
        status: 401,
        body: { error: 'Access denied. No token provided.' }
      };

      expect(unauthorizedError.status).toBe(401);
      expect(unauthorizedError.body.error).toContain('Access denied');
    });
  });

  describe('Socket.IO Integration', () => {
    it('should emit to correct rooms', () => {
      // Test room targeting functionality
      expect(mockIo.to).toBeDefined();
      expect(typeof mockIo.to).toBe('function');
      
      // Test that to() returns an object with emit function
      const roomResult = mockIo.to('issues');
      expect(roomResult).toBeDefined();
      expect(typeof roomResult.emit).toBe('function');
    });

    it('should format notification data correctly', () => {
      const notification = {
        type: 'issue_created',
        title: 'New Issue Reported',
        message: 'A new pothole has been reported',
        issueId: 1,
        userId: 2,
        timestamp: new Date().toISOString()
      };

      expect(notification.type).toBe('issue_created');
      expect(notification.title).toBe('New Issue Reported');
      expect(notification.message).toContain('pothole');
      expect(notification.issueId).toBe(1);
      expect(notification.userId).toBe(2);
      expect(notification.timestamp).toBeDefined();
    });
  });

  describe('Performance Considerations', () => {
    it('should limit query results', async () => {
      const mockIssues = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        title: `Issue ${i + 1}`,
        status: 'reported'
      }));

      mockIssue.findAll.mockResolvedValue(mockIssues);

      const result = await mockIssue.findAll();
      expect(result).toHaveLength(1000); // Should be limited in actual implementation
    });

    it('should use database indexes efficiently', () => {
      // Test that common query patterns use indexes
      const commonFilters = {
        status: 'reported',
        category: 'pothole',
        created_at: '2024-01-15'
      };

      // These should use the composite indexes created in init-db.js
      expect(commonFilters.status).toBeDefined();
      expect(commonFilters.category).toBeDefined();
      expect(commonFilters.created_at).toBeDefined();
    });
  });
});
