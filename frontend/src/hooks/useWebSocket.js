import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const { token } = useAuth()
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    if (!token) return

    const connect = () => {
      try {
        const ws = new WebSocket(`${url}?token=${token}`)
        
        ws.onopen = () => {
          console.log('WebSocket connected')
          setConnected(true)
          setSocket(ws)
          reconnectAttempts.current = 0
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setLastMessage(data)
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason)
          setConnected(false)
          setSocket(null)

          // Attempt to reconnect if not a manual close
          if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.pow(2, reconnectAttempts.current) * 1000 // Exponential backoff
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++
              connect()
            }, delay)
          }
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          setConnected(false)
        }

        return ws
      } catch (error) {
        console.error('Error creating WebSocket connection:', error)
        setConnected(false)
      }
    }

    const ws = connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (ws) {
        ws.close(1000, 'Component unmounting')
      }
    }
  }, [url, token])

  const sendMessage = (message) => {
    if (socket && connected) {
      socket.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected')
    }
  }

  return {
    socket,
    connected,
    lastMessage,
    sendMessage
  }
}
