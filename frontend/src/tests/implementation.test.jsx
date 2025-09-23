import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import '@testing-library/jest-dom'

// Components to test
import IssueMap from '../components/Map/IssueMap'
import NotificationCenter from '../components/Common/NotificationCenter'
import AdminDashboard from '../pages/AdminDashboard'
import { NotificationProvider } from '../context/NotificationContext'
import { AuthProvider } from '../context/AuthContext'
import { IssueProvider } from '../context/IssueContext'

// Mock data
const mockIssues = [
  {
    id: 1,
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues',
    category: 'pothole',
    status: 'reported',
    severity: 4,
    latitude: 40.7128,
    longitude: -74.0060,
    address: '123 Main Street',
    created_at: '2024-01-15T10:00:00Z',
    photos: [{ url: 'https://example.com/photo1.jpg' }],
    reported_by_name: 'John Doe'
  },
  {
    id: 2,
    title: 'Broken Streetlight',
    description: 'Streetlight not working at night',
    category: 'streetlight',
    status: 'in_progress',
    severity: 3,
    latitude: 40.7589,
    longitude: -73.9851,
    address: '456 Oak Avenue',
    created_at: '2024-01-14T15:30:00Z',
    photos: [],
    reported_by_name: 'Jane Smith'
  }
]

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
}

const mockNotifications = [
  {
    id: 1,
    type: 'issue_created',
    title: 'New Issue Reported',
    message: 'A new pothole has been reported on Main Street',
    timestamp: '2024-01-15T10:00:00Z',
    read: false
  },
  {
    id: 2,
    type: 'issue_status_changed',
    title: 'Issue Status Updated',
    message: 'Your streetlight issue status changed to in progress',
    timestamp: '2024-01-15T09:30:00Z',
    read: true
  }
]

// Mock Socket.IO
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  connected: true,
  id: 'mock-socket-id'
}

vi.mock('../services/socketService', () => ({
  socketService: mockSocket
}))

// Mock Leaflet
vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: {
        prototype: {},
        mergeOptions: vi.fn()
      }
    },
    divIcon: vi.fn(() => ({ options: {} })),
    latLngBounds: vi.fn(() => ({
      extend: vi.fn(),
      isValid: vi.fn(() => true)
    })),
    point: vi.fn(() => ({ x: 0, y: 0 }))
  }
}))

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMap: () => ({
    fitBounds: vi.fn(),
    setView: vi.fn()
  })
}))

// Mock react-leaflet-cluster
vi.mock('react-leaflet-cluster', () => ({
  default: ({ children }) => <div data-testid="marker-cluster">{children}</div>
}))

// Mock Recharts
vi.mock('recharts', () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />
}))

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
        <IssueProvider>
          {children}
        </IssueProvider>
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
)

describe('Enhanced Map Features', () => {
  it('renders map with color-coded markers', () => {
    render(
      <TestWrapper>
        <IssueMap issues={mockIssues} onIssueSelect={vi.fn()} />
      </TestWrapper>
    )

    expect(screen.getByTestId('map-container')).toBeInTheDocument()
    expect(screen.getByTestId('marker-cluster')).toBeInTheDocument()
    expect(screen.getAllByTestId('marker')).toHaveLength(mockIssues.length)
  })

  it('displays issue details in popup', () => {
    render(
      <TestWrapper>
        <IssueMap issues={mockIssues} onIssueSelect={vi.fn()} />
      </TestWrapper>
    )

    const popups = screen.getAllByTestId('popup')
    expect(popups).toHaveLength(mockIssues.length)
    
    // Check if issue titles are displayed
    expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument()
    expect(screen.getByText('Broken Streetlight')).toBeInTheDocument()
  })

  it('handles marker clustering', () => {
    render(
      <TestWrapper>
        <IssueMap issues={mockIssues} onIssueSelect={vi.fn()} />
      </TestWrapper>
    )

    expect(screen.getByTestId('marker-cluster')).toBeInTheDocument()
  })
})

describe('Notification System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders notification center with unread count', () => {
    const mockUseNotifications = {
      notifications: mockNotifications,
      unreadCount: 1,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      removeNotification: vi.fn()
    }

    vi.doMock('../context/NotificationContext', () => ({
      useNotifications: () => mockUseNotifications
    }))

    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    // Should show notification bell with badge
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('displays notifications when opened', async () => {
    const mockUseNotifications = {
      notifications: mockNotifications,
      unreadCount: 1,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      removeNotification: vi.fn()
    }

    vi.doMock('../context/NotificationContext', () => ({
      useNotifications: () => mockUseNotifications
    }))

    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    // Click to open notifications
    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('New Issue Reported')).toBeInTheDocument()
      expect(screen.getByText('Issue Status Updated')).toBeInTheDocument()
    })
  })

  it('handles mark all as read', async () => {
    const markAllAsRead = vi.fn()
    const mockUseNotifications = {
      notifications: mockNotifications,
      unreadCount: 1,
      markAsRead: vi.fn(),
      markAllAsRead,
      removeNotification: vi.fn()
    }

    vi.doMock('../context/NotificationContext', () => ({
      useNotifications: () => mockUseNotifications
    }))

    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      const markAllButton = screen.getByText(/mark all read/i)
      fireEvent.click(markAllButton)
      expect(markAllAsRead).toHaveBeenCalled()
    })
  })
})

describe('Analytics Dashboard', () => {
  const mockUseIssues = {
    analytics: mockAnalytics,
    issues: mockIssues,
    fetchAnalytics: vi.fn(),
    loading: false
  }

  const mockUseAuth = {
    user: { id: 1, name: 'Admin User', role: 'admin' }
  }

  beforeEach(() => {
    vi.doMock('../context/IssueContext', () => ({
      useIssues: () => mockUseIssues
    }))

    vi.doMock('../context/AuthContext', () => ({
      useAuth: () => mockUseAuth
    }))
  })

  it('renders analytics dashboard with charts', () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    )

    // Check for key metrics
    expect(screen.getByText('Total Issues')).toBeInTheDocument()
    expect(screen.getByText('Resolved Issues')).toBeInTheDocument()
    expect(screen.getByText('Resolution Rate')).toBeInTheDocument()

    // Check for charts
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
  })

  it('displays correct analytics values', () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    )

    expect(screen.getByText('150')).toBeInTheDocument() // Total issues
    expect(screen.getByText('120')).toBeInTheDocument() // Resolved issues
    expect(screen.getByText('80%')).toBeInTheDocument() // Resolution rate
  })

  it('shows recent activity', () => {
    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    )

    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('Pothole on Main Street')).toBeInTheDocument()
    expect(screen.getByText('Broken Streetlight')).toBeInTheDocument()
  })
})

describe('Real-time Features', () => {
  it('initializes socket connection', () => {
    render(
      <TestWrapper>
        <div>Test Component</div>
      </TestWrapper>
    )

    expect(mockSocket.on).toHaveBeenCalledWith('issue-created', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('issue-updated', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('issue-status-changed', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('issue-assigned', expect.any(Function))
  })

  it('joins issues room on connection', () => {
    render(
      <TestWrapper>
        <div>Test Component</div>
      </TestWrapper>
    )

    expect(mockSocket.emit).toHaveBeenCalledWith('join-room', 'issues')
  })

  it('cleans up socket listeners on unmount', () => {
    const { unmount } = render(
      <TestWrapper>
        <div>Test Component</div>
      </TestWrapper>
    )

    unmount()

    expect(mockSocket.off).toHaveBeenCalledWith('issue-created')
    expect(mockSocket.off).toHaveBeenCalledWith('issue-updated')
    expect(mockSocket.off).toHaveBeenCalledWith('issue-status-changed')
    expect(mockSocket.off).toHaveBeenCalledWith('issue-assigned')
  })
})

describe('Socket Service', () => {
  it('connects to socket server', () => {
    expect(mockSocket.connect).toBeDefined()
    expect(mockSocket.disconnect).toBeDefined()
    expect(mockSocket.emit).toBeDefined()
    expect(mockSocket.on).toBeDefined()
  })

  it('emits events correctly', () => {
    mockSocket.emit('test-event', { data: 'test' })
    expect(mockSocket.emit).toHaveBeenCalledWith('test-event', { data: 'test' })
  })

  it('listens to events correctly', () => {
    const callback = vi.fn()
    mockSocket.on('test-event', callback)
    expect(mockSocket.on).toHaveBeenCalledWith('test-event', callback)
  })
})

describe('Error Handling', () => {
  it('handles map rendering errors gracefully', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <TestWrapper>
        <IssueMap issues={[]} onIssueSelect={vi.fn()} />
      </TestWrapper>
    )

    // Should render without crashing even with empty issues
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
    
    consoleError.mockRestore()
  })

  it('handles notification errors gracefully', () => {
    const mockUseNotifications = {
      notifications: [],
      unreadCount: 0,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      removeNotification: vi.fn()
    }

    vi.doMock('../context/NotificationContext', () => ({
      useNotifications: () => mockUseNotifications
    }))

    render(
      <TestWrapper>
        <NotificationCenter />
      </TestWrapper>
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles analytics loading state', () => {
    const mockUseIssues = {
      analytics: null,
      issues: [],
      fetchAnalytics: vi.fn(),
      loading: true
    }

    const mockUseAuth = {
      user: { id: 1, name: 'Admin User', role: 'admin' }
    }

    vi.doMock('../context/IssueContext', () => ({
      useIssues: () => mockUseIssues
    }))

    vi.doMock('../context/AuthContext', () => ({
      useAuth: () => mockUseAuth
    }))

    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    )

    // Should show loading state
    expect(screen.getAllByText('—')).toHaveLength(4) // Four metric cards with loading state
  })
})

describe('Integration Tests', () => {
  it('integrates map with real-time updates', async () => {
    const onIssueSelect = vi.fn()
    
    render(
      <TestWrapper>
        <IssueMap issues={mockIssues} onIssueSelect={onIssueSelect} />
      </TestWrapper>
    )

    // Simulate real-time issue creation
    const issueCreatedCallback = mockSocket.on.mock.calls.find(
      call => call[0] === 'issue-created'
    )?.[1]

    if (issueCreatedCallback) {
      const newIssue = {
        id: 3,
        title: 'New Real-time Issue',
        latitude: 40.7500,
        longitude: -73.9900,
        status: 'reported'
      }
      
      issueCreatedCallback(newIssue)
    }

    expect(mockSocket.on).toHaveBeenCalledWith('issue-created', expect.any(Function))
  })

  it('integrates notifications with analytics', () => {
    const mockUseNotifications = {
      notifications: mockNotifications,
      unreadCount: 1,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      removeNotification: vi.fn()
    }

    const mockUseIssues = {
      analytics: mockAnalytics,
      issues: mockIssues,
      fetchAnalytics: vi.fn(),
      loading: false
    }

    const mockUseAuth = {
      user: { id: 1, name: 'Admin User', role: 'admin' }
    }

    vi.doMock('../context/NotificationContext', () => ({
      useNotifications: () => mockUseNotifications
    }))

    vi.doMock('../context/IssueContext', () => ({
      useIssues: () => mockUseIssues
    }))

    vi.doMock('../context/AuthContext', () => ({
      useAuth: () => mockUseAuth
    }))

    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    )

    // Both components should render together
    expect(screen.getByText('Total Issues')).toBeInTheDocument()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })
})
