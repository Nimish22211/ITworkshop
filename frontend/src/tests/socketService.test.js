import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { socketService } from '../services/socketService'

// Mock socket.io-client
vi.mock('socket.io-client', () => {
  const mockSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
    id: null
  }

  const mockIo = vi.fn(() => mockSocket)

  return {
    io: mockIo
  }
})

describe('SocketService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    socketService.socket = null
    socketService.connected = false
  })

  afterEach(() => {
    if (socketService.socket) {
      socketService.disconnect()
    }
  })

  describe('Connection Management', () => {
    it('should connect to socket server', () => {
      socketService.connect()

      expect(mockIo).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true,
          reconnection: true
        })
      )
    })

    it('should return existing socket if already connected', () => {
      socketService.socket = mockSocket
      socketService.connected = true

      const result = socketService.connect()

      expect(result).toBe(mockSocket)
      expect(mockIo).not.toHaveBeenCalled()
    })

    it('should disconnect from socket server', () => {
      socketService.socket = mockSocket
      socketService.connected = true

      socketService.disconnect()

      expect(mockSocket.disconnect).toHaveBeenCalled()
      expect(socketService.socket).toBeNull()
      expect(socketService.connected).toBe(false)
    })

    it('should handle disconnect when no socket exists', () => {
      socketService.socket = null

      expect(() => socketService.disconnect()).not.toThrow()
    })
  })

  describe('Event Handling', () => {
    beforeEach(() => {
      socketService.socket = mockSocket
      socketService.connected = true
    })

    it('should emit events when connected', () => {
      const eventData = { test: 'data' }
      
      socketService.emit('test-event', eventData)

      expect(mockSocket.emit).toHaveBeenCalledWith('test-event', eventData)
    })

    it('should not emit events when disconnected', () => {
      socketService.connected = false
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      socketService.emit('test-event', {})

      expect(mockSocket.emit).not.toHaveBeenCalled()
      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Socket not connected')
      )

      consoleWarn.mockRestore()
    })

    it('should register event listeners', () => {
      const callback = vi.fn()

      socketService.on('test-event', callback)

      expect(mockSocket.on).toHaveBeenCalledWith('test-event', callback)
    })

    it('should remove event listeners', () => {
      const callback = vi.fn()

      socketService.off('test-event', callback)

      expect(mockSocket.off).toHaveBeenCalledWith('test-event', callback)
    })

    it('should handle listener registration when no socket exists', () => {
      socketService.socket = null
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      socketService.on('test-event', vi.fn())

      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Socket not initialized')
      )

      consoleWarn.mockRestore()
    })
  })

  describe('Room Management', () => {
    beforeEach(() => {
      socketService.socket = mockSocket
      socketService.connected = true
    })

    it('should join issues room', () => {
      socketService.joinIssuesRoom()

      expect(mockSocket.emit).toHaveBeenCalledWith('join-room', 'issues')
    })

    it('should leave issues room', () => {
      socketService.leaveIssuesRoom()

      expect(mockSocket.emit).toHaveBeenCalledWith('leave-room', 'issues')
    })

    it('should join user room', () => {
      const userId = 123

      socketService.joinUserRoom(userId)

      expect(mockSocket.emit).toHaveBeenCalledWith('join-room', 'user-123')
    })

    it('should leave user room', () => {
      const userId = 123

      socketService.leaveUserRoom(userId)

      expect(mockSocket.emit).toHaveBeenCalledWith('leave-room', 'user-123')
    })
  })

  describe('Issue Events', () => {
    beforeEach(() => {
      socketService.socket = mockSocket
      socketService.connected = true
    })

    it('should emit issue created event', () => {
      const issue = { id: 1, title: 'Test Issue' }

      socketService.emitIssueCreated(issue)

      expect(mockSocket.emit).toHaveBeenCalledWith('issue-created', issue)
    })

    it('should emit issue updated event', () => {
      const issue = { id: 1, title: 'Updated Issue' }

      socketService.emitIssueUpdated(issue)

      expect(mockSocket.emit).toHaveBeenCalledWith('issue-updated', issue)
    })

    it('should emit issue status changed event', () => {
      const issueId = 1
      const status = 'resolved'
      const updatedBy = 123

      socketService.emitIssueStatusChanged(issueId, status, updatedBy)

      expect(mockSocket.emit).toHaveBeenCalledWith('issue-status-changed', {
        issueId,
        status,
        updatedBy,
        timestamp: expect.any(String)
      })
    })

    it('should emit issue assigned event', () => {
      const issueId = 1
      const assignedTo = 456
      const assignedBy = 123

      socketService.emitIssueAssigned(issueId, assignedTo, assignedBy)

      expect(mockSocket.emit).toHaveBeenCalledWith('issue-assigned', {
        issueId,
        assignedTo,
        assignedBy,
        timestamp: expect.any(String)
      })
    })
  })

  describe('Event Listeners', () => {
    beforeEach(() => {
      socketService.socket = mockSocket
      socketService.connected = true
    })

    it('should register issue created listener', () => {
      const callback = vi.fn()

      socketService.onIssueCreated(callback)

      expect(mockSocket.on).toHaveBeenCalledWith('issue-created', callback)
    })

    it('should register issue updated listener', () => {
      const callback = vi.fn()

      socketService.onIssueUpdated(callback)

      expect(mockSocket.on).toHaveBeenCalledWith('issue-updated', callback)
    })

    it('should register issue status changed listener', () => {
      const callback = vi.fn()

      socketService.onIssueStatusChanged(callback)

      expect(mockSocket.on).toHaveBeenCalledWith('issue-status-changed', callback)
    })

    it('should register issue assigned listener', () => {
      const callback = vi.fn()

      socketService.onIssueAssigned(callback)

      expect(mockSocket.on).toHaveBeenCalledWith('issue-assigned', callback)
    })
  })

  describe('Connection Status', () => {
    it('should return connection status', () => {
      socketService.socket = mockSocket
      socketService.connected = true
      mockSocket.connected = true

      expect(socketService.isConnected()).toBe(true)
    })

    it('should return false when not connected', () => {
      socketService.socket = null
      socketService.connected = false

      expect(socketService.isConnected()).toBe(false)
    })

    it('should return socket ID when connected', () => {
      socketService.socket = mockSocket
      mockSocket.id = 'test-socket-id'

      expect(socketService.getSocketId()).toBe('test-socket-id')
    })

    it('should return undefined when no socket', () => {
      socketService.socket = null

      expect(socketService.getSocketId()).toBeUndefined()
    })
  })

  describe('Connection Events', () => {
    it('should handle connection event', () => {
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      socketService.connect()

      // Simulate connection event
      const connectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect'
      )?.[1]

      if (connectHandler) {
        connectHandler()
      }

      expect(consoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Connected to Socket.IO server')
      )

      consoleLog.mockRestore()
    })

    it('should handle disconnect event', () => {
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      socketService.connect()

      // Simulate disconnect event
      const disconnectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'disconnect'
      )?.[1]

      if (disconnectHandler) {
        disconnectHandler('transport close')
      }

      expect(consoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Disconnected from Socket.IO server')
      )

      consoleLog.mockRestore()
    })

    it('should handle connection error', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      socketService.connect()

      // Simulate connection error
      const errorHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'connect_error'
      )?.[1]

      if (errorHandler) {
        errorHandler(new Error('Connection failed'))
      }

      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('Socket.IO connection error')
      )

      consoleError.mockRestore()
    })

    it('should handle reconnection', () => {
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      socketService.connect()

      // Simulate reconnection
      const reconnectHandler = mockSocket.on.mock.calls.find(
        call => call[0] === 'reconnect'
      )?.[1]

      if (reconnectHandler) {
        reconnectHandler(3)
      }

      expect(consoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Reconnected to Socket.IO server (attempt 3)')
      )

      consoleLog.mockRestore()
    })
  })
})
