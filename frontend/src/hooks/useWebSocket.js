import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

export const useSocket = () => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [newIssue, setNewIssue] = useState(null)
  const [updatedIssue, setUpdatedIssue] = useState(null)
  const [assignedIssue, setAssignedIssue] = useState(null)
  const { token } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    // Create socket connection
    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    
    const socketInstance = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    })

    socketRef.current = socketInstance
    setSocket(socketInstance)

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('🔌 Socket.IO connected:', socketInstance.id)
      setConnected(true)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason)
      setConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('🔌 Socket.IO connection error:', error)
      setConnected(false)
    })

    // Issue event handlers
    socketInstance.on('new-issue', (issue) => {
      console.log('📝 New issue received:', issue)
      setNewIssue(issue)
    })

    socketInstance.on('issue-updated', (issue) => {
      console.log('🔄 Issue updated:', issue)
      setUpdatedIssue(issue)
    })

    socketInstance.on('issue-assigned', (issue) => {
      console.log('👨‍💼 Issue assigned:', issue)
      setAssignedIssue(issue)
    })

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up socket connection')
      socketInstance.disconnect()
    }
  }, [token])

  const joinRoom = (room) => {
    if (socket && connected) {
      socket.emit('join-room', room)
      console.log(`🏠 Joined room: ${room}`)
    }
  }

  const leaveRoom = (room) => {
    if (socket && connected) {
      socket.emit('leave-room', room)
      console.log(`🏠 Left room: ${room}`)
    }
  }

  return {
    socket,
    connected,
    newIssue,
    updatedIssue,
    assignedIssue,
    joinRoom,
    leaveRoom,
    // Clear event data after consumption
    clearNewIssue: () => setNewIssue(null),
    clearUpdatedIssue: () => setUpdatedIssue(null),
    clearAssignedIssue: () => setAssignedIssue(null)
  }
}

// Keep the old hook for backward compatibility
export const useWebSocket = useSocket
