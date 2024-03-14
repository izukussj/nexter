'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Only create socket if it doesn't exist
    if (!socket) {
      socket = io('http://localhost:3001', {
        transports: ['websocket', 'polling'],
        autoConnect: true
      })

      socket.on('connect', () => {
        console.log('Connected to socket server')
        setIsConnected(true)
      })

      socket.on('disconnect', () => {
        console.log('Disconnected from socket server')
        setIsConnected(false)
      })
    }

    // Check if already connected
    if (socket.connected) {
      setIsConnected(true)
    }

    return () => {
      // Don't disconnect on unmount - keep the socket alive
    }
  }, [])

  return { socket, isConnected }
}

// Export function to manually disconnect
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}