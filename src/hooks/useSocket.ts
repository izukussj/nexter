'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

let socket: Socket

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    socket = io(process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000', {
      path: '/api/socket/io',
      addTrailingSlash: false,
    })

    socket.on('connect', () => {
      console.log('Connected to socket server')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server')
      setIsConnected(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return { socket, isConnected }
}