const { createServer } = require('http')
const { Server } = require('socket.io')

// Pour l'instant, on importe nos classes avec require
// En production, il faudrait compiler le TypeScript
const { GameService } = require('./dist/application/services/GameService')
const { InMemoryGameRepository } = require('./dist/infrastructure/repositories/InMemoryGameRepository')
const { InMemoryQuestionRepository } = require('./dist/infrastructure/repositories/InMemoryQuestionRepository')
const { SocketGameEventPublisher } = require('./dist/infrastructure/events/SocketGameEventPublisher')

// Lobby management (en attendant de le refactorer aussi)
const lobbyPlayers = new Map()

const server = createServer()
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Initialize dependencies (Dependency Injection)
const gameRepository = new InMemoryGameRepository()
const questionRepository = new InMemoryQuestionRepository()
const eventPublisher = new SocketGameEventPublisher(io)
const gameService = new GameService(gameRepository, questionRepository, eventPublisher)

// Cleanup task
setInterval(() => {
  gameRepository.cleanup()
}, 60 * 60 * 1000) // Every hour

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Lobby management (legacy code for now)
  socket.on('join-lobby', (data) => {
    const lobbyRoom = `lobby-${data.gameType}`
    socket.join(lobbyRoom)
    
    const playerData = {
      playerId: socket.id,
      username: data.username || `Player-${socket.id.slice(0, 6)}`,
      timestamp: new Date()
    }
    
    if (!lobbyPlayers.has(lobbyRoom)) {
      lobbyPlayers.set(lobbyRoom, new Map())
    }
    lobbyPlayers.get(lobbyRoom).set(socket.id, playerData)
    
    socket.username = data.username
    socket.currentLobby = lobbyRoom
    
    socket.emit('joined-lobby', {
      room: lobbyRoom,
      message: `Joined ${data.gameType} lobby`
    })

    const allPlayers = Array.from(lobbyPlayers.get(lobbyRoom).values())
    
    for (const socketId of io.sockets.adapter.rooms.get(lobbyRoom) || []) {
      const targetSocket = io.sockets.sockets.get(socketId)
      if (targetSocket) {
        targetSocket.emit('lobby-update', { players: allPlayers })
      }
    }
    
    console.log(`Player ${data.username} joined ${lobbyRoom}, total players:`, allPlayers.length)
  })

  socket.on('leave-lobby', (data) => {
    const lobbyRoom = `lobby-${data.gameType}`
    socket.leave(lobbyRoom)
    
    if (lobbyPlayers.has(lobbyRoom)) {
      lobbyPlayers.get(lobbyRoom).delete(socket.id)
      
      const remainingPlayers = Array.from(lobbyPlayers.get(lobbyRoom).values())
      for (const socketId of io.sockets.adapter.rooms.get(lobbyRoom) || []) {
        const targetSocket = io.sockets.sockets.get(socketId)
        if (targetSocket) {
          targetSocket.emit('lobby-update', { players: remainingPlayers })
        }
      }
    }
    
    console.log(`Player ${socket.username} left ${lobbyRoom}`)
  })

  // CLEAN ARCHITECTURE: Start Game Use Case
  socket.on('start-game', async (data) => {
    try {
      console.log('Starting game with clean architecture:', data)
      
      // Prepare players for the game
      const players = data.players.map(p => ({
        id: p.id,
        username: p.username
      }))

      // Add players to the game room first
      const game = await gameService.startGame({
        gameType: data.gameType,
        players
      })

      const gameId = game.getId().toString()
      
      // Join players to the game room
      data.players.forEach(player => {
        const playerSocket = io.sockets.sockets.get(player.id)
        if (playerSocket) {
          console.log(`Adding player ${player.username} to game room ${gameId}`)
          playerSocket.join(gameId)
        }
      })

      console.log(`Game ${gameId} started successfully`)

    } catch (error) {
      console.error('Error starting game:', error)
      socket.emit('game-error', { message: error.message })
    }
  })

  // CLEAN ARCHITECTURE: Submit Answer Use Case
  socket.on('submit-answer', async (data) => {
    try {
      console.log('Submitting answer with clean architecture:', data)
      
      await gameService.submitAnswer({
        gameId: data.gameId,
        playerId: socket.id,
        answer: data.answer,
        questionId: data.questionId
      })

      console.log(`Answer submitted successfully by ${socket.id}`)

    } catch (error) {
      console.error('Error submitting answer:', error)
      socket.emit('answer-error', { message: error.message })
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    
    // Clean up lobby
    if (socket.currentLobby && lobbyPlayers.has(socket.currentLobby)) {
      lobbyPlayers.get(socket.currentLobby).delete(socket.id)
      
      const remainingPlayers = Array.from(lobbyPlayers.get(socket.currentLobby).values())
      for (const socketId of io.sockets.adapter.rooms.get(socket.currentLobby) || []) {
        const targetSocket = io.sockets.sockets.get(socketId)
        if (targetSocket) {
          targetSocket.emit('lobby-update', { players: remainingPlayers })
        }
      }
    }
  })
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`🎯 Hexagonal Architecture Server running on port ${PORT}`)
  console.log('🏗️ Clean Architecture initialized with:')
  console.log('   - Domain Layer: Entities, Value Objects, Ports')
  console.log('   - Application Layer: Use Cases, Services')  
  console.log('   - Infrastructure Layer: Repositories, Event Publishers')
})