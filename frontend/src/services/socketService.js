import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
  }

  connect() {
    if (this.socket && this.connected) {
      return this.socket
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5
    })

    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server')
      this.connected = true
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.IO server:', reason)
      this.connected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error)
      this.connected = false
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected to Socket.IO server (attempt ${attemptNumber})`)
      this.connected = true
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Socket.IO reconnection error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
      console.log('🔌 Disconnected from Socket.IO server')
    }
  }

  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn('⚠️ Socket not connected, cannot emit event:', event)
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    } else {
      console.warn('⚠️ Socket not initialized, cannot listen to event:', event)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  // Convenience methods for issue-related events
  joinIssuesRoom() {
    this.emit('join-room', 'issues')
  }

  leaveIssuesRoom() {
    this.emit('leave-room', 'issues')
  }

  joinUserRoom(userId) {
    this.emit('join-room', `user-${userId}`)
  }

  leaveUserRoom(userId) {
    this.emit('leave-room', `user-${userId}`)
  }

  // Issue-specific event emitters
  emitIssueCreated(issue) {
    this.emit('issue-created', issue)
  }

  emitIssueUpdated(issue) {
    this.emit('issue-updated', issue)
  }

  emitIssueStatusChanged(issueId, status, updatedBy) {
    this.emit('issue-status-changed', {
      issueId,
      status,
      updatedBy,
      timestamp: new Date().toISOString()
    })
  }

  emitIssueAssigned(issueId, assignedTo, assignedBy) {
    this.emit('issue-assigned', {
      issueId,
      assignedTo,
      assignedBy,
      timestamp: new Date().toISOString()
    })
  }

  // Listen to issue events with callbacks
  onIssueCreated(callback) {
    this.on('issue-created', callback)
  }

  onIssueUpdated(callback) {
    this.on('issue-updated', callback)
  }

  onIssueStatusChanged(callback) {
    this.on('issue-status-changed', callback)
  }

  onIssueAssigned(callback) {
    this.on('issue-assigned', callback)
  }

  // Check connection status
  isConnected() {
    return this.connected && this.socket?.connected
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id
  }
}

// Create and export a singleton instance
export const socketService = new SocketService()
export default socketService
