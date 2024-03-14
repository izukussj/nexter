const { createServer } = require('http')
const { Server } = require('socket.io')

const demoQuestions = [
  {
    id: '1',
    text: 'Quelle est la capitale de la France ?',
    answer: 'Paris',
    category: 'Géographie',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '2',
    text: 'En quelle année a eu lieu la Révolution française ?',
    answer: '1789',
    category: 'Histoire',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '3',
    text: 'Qui a écrit "Les Misérables" ?',
    answer: 'Victor Hugo',
    category: 'Littérature',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '4',
    text: 'Quelle est la formule chimique de l\'eau ?',
    answer: 'H2O',
    category: 'Sciences',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '5',
    text: 'Combien de joueurs composent une équipe de football sur le terrain ?',
    answer: '11',
    category: 'Sport',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '6',
    text: 'Quel est le plus grand océan du monde ?',
    answer: 'Océan Pacifique',
    category: 'Géographie',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '7',
    text: 'Qui a peint la Joconde ?',
    answer: 'Léonard de Vinci',
    category: 'Arts',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '8',
    text: 'Quelle planète est surnommée la "planète rouge" ?',
    answer: 'Mars',
    category: 'Sciences',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '9',
    text: 'Dans quel pays se trouve Machu Picchu ?',
    answer: 'Pérou',
    category: 'Géographie',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '10',
    text: 'Combien y a-t-il de cordes sur une guitare classique ?',
    answer: '6',
    category: 'Arts',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '11',
    text: 'Quel est l\'élément chimique dont le symbole est "Au" ?',
    answer: 'Or',
    category: 'Sciences',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '12',
    text: 'En quelle année l\'homme a-t-il marché sur la Lune pour la première fois ?',
    answer: '1969',
    category: 'Histoire',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '13',
    text: 'Quelle est la monnaie officielle du Japon ?',
    answer: 'Yen',
    category: 'Culture générale',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '14',
    text: 'Combien de minutes y a-t-il dans une heure ?',
    answer: '60',
    category: 'Culture générale',
    imageUrl: null,
    videoUrl: null
  },
  {
    id: '15',
    text: 'Quel sport pratique-t-on à Wimbledon ?',
    answer: 'Tennis',
    category: 'Sport',
    imageUrl: null,
    videoUrl: null
  }
]

const getRandomQuestions = (count = 5) => {
  const shuffled = [...demoQuestions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

const activeGames = new Map()
const lobbyPlayers = new Map() // Stockage des joueurs par lobby

const server = createServer()
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-lobby', (data) => {
    const lobbyRoom = `lobby-${data.gameType}`
    socket.join(lobbyRoom)
    
    const playerData = {
      playerId: socket.id,
      username: data.username || `Player-${socket.id.slice(0, 6)}`,
      timestamp: new Date()
    }
    
    // Stocker le joueur dans le lobby
    if (!lobbyPlayers.has(lobbyRoom)) {
      lobbyPlayers.set(lobbyRoom, new Map())
    }
    lobbyPlayers.get(lobbyRoom).set(socket.id, playerData)
    
    // Stocker le username dans le socket pour référence future
    socket.username = data.username
    socket.currentLobby = lobbyRoom
    
    // Confirmer la connexion au joueur qui rejoint
    socket.emit('joined-lobby', {
      room: lobbyRoom,
      message: `Joined ${data.gameType} lobby`
    })

    // Envoyer la liste complète à tous les joueurs du lobby
    const allPlayers = Array.from(lobbyPlayers.get(lobbyRoom).values())
    
    // Envoyer à tous les joueurs la liste mise à jour
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
    
    // Retirer le joueur du lobby
    if (lobbyPlayers.has(lobbyRoom)) {
      lobbyPlayers.get(lobbyRoom).delete(socket.id)
      
      // Mettre à jour tous les joueurs restants
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

  socket.on('start-game', (data) => {
    console.log('Start game event received:', data)
    const gameRoom = `game-${Date.now()}`
    const questions = getRandomQuestions(5)
    
    const gameState = {
      gameId: gameRoom,
      players: data.players.map(p => ({ ...p, score: 0 })),
      questions,
      currentQuestionIndex: 0,
      gameType: data.gameType,
      status: 'waiting',
      answers: new Map()
    }
    
    activeGames.set(gameRoom, gameState)
    console.log('Game created with ID:', gameRoom)
    
    data.players.forEach(player => {
      const playerSocket = io.sockets.sockets.get(player.id)
      if (playerSocket) {
        console.log(`Adding player ${player.username} (${player.id}) to game room ${gameRoom}`)
        playerSocket.join(gameRoom)
      }
    })

    console.log('Emitting game-started event to room:', gameRoom)
    io.to(gameRoom).emit('game-started', {
      gameId: gameRoom,
      players: gameState.players,
      gameType: data.gameType,
      totalQuestions: questions.length
    })

    setTimeout(() => {
      startNextQuestion(gameRoom)
    }, 3000)
  })

  socket.on('submit-answer', (data) => {
    console.log('Received answer submission:', data)
    const game = activeGames.get(data.gameId)
    if (!game || game.status !== 'playing') {
      console.log('Game not found or not playing:', { gameExists: !!game, status: game?.status })
      return
    }

    const currentQuestion = game.questions[game.currentQuestionIndex]
    if (currentQuestion.id !== data.questionId) {
      console.log('Question ID mismatch:', { expected: currentQuestion.id, received: data.questionId })
      return
    }
    
    console.log('Processing answer for question:', currentQuestion.text)

    game.answers.set(socket.id, {
      answer: data.answer.trim().toLowerCase(),
      timestamp: Date.now()
    })

    const playerIndex = game.players.findIndex(p => p.id === socket.id)
    if (playerIndex !== -1) {
      const correctAnswer = currentQuestion.answer.toLowerCase()
      const playerAnswer = data.answer.trim().toLowerCase()
      
      if (playerAnswer === correctAnswer) {
        const timeBonus = Math.max(0, 10 - Math.floor((Date.now() - (game.questionStartTime || 0)) / 1000))
        game.players[playerIndex].score += 10 + timeBonus
      }
    }

    io.to(data.gameId).emit('answer-submitted', {
      playerId: socket.id,
      username: game.players.find(p => p.id === socket.id)?.username,
      hasAnswered: true
    })

    if (game.answers.size === game.players.length) {
      endQuestion(data.gameId)
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    
    // Nettoyer les lobbys
    if (socket.currentLobby && lobbyPlayers.has(socket.currentLobby)) {
      lobbyPlayers.get(socket.currentLobby).delete(socket.id)
      
      // Mettre à jour tous les joueurs restants
      const remainingPlayers = Array.from(lobbyPlayers.get(socket.currentLobby).values())
      for (const socketId of io.sockets.adapter.rooms.get(socket.currentLobby) || []) {
        const targetSocket = io.sockets.sockets.get(socketId)
        if (targetSocket) {
          targetSocket.emit('lobby-update', { players: remainingPlayers })
        }
      }
    }
  })

  function startNextQuestion(gameId) {
    const game = activeGames.get(gameId)
    if (!game) return

    if (game.currentQuestionIndex >= game.questions.length) {
      endGame(gameId)
      return
    }

    const question = game.questions[game.currentQuestionIndex]
    game.status = 'playing'
    game.questionStartTime = Date.now()
    game.answers.clear()

    io.to(gameId).emit('new-question', {
      question: {
        id: question.id,
        text: question.text,
        category: question.category,
        imageUrl: question.imageUrl,
        videoUrl: question.videoUrl
      },
      questionNumber: game.currentQuestionIndex + 1,
      totalQuestions: game.questions.length,
      timeLimit: 30
    })

    // Timer synchronisé pour tous les clients
    let timeLeft = 30
    const timerInterval = setInterval(() => {
      timeLeft--
      io.to(gameId).emit('timer-update', { timeLeft })
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval)
      }
    }, 1000)

    setTimeout(() => {
      clearInterval(timerInterval)
      endQuestion(gameId)
    }, 30000)
  }

  function endQuestion(gameId) {
    const game = activeGames.get(gameId)
    if (!game) return

    const question = game.questions[game.currentQuestionIndex]
    
    io.to(gameId).emit('question-ended', {
      correctAnswer: question.answer,
      category: question.category,
      scores: game.players.map(p => ({ 
        id: p.id, 
        username: p.username, 
        score: p.score 
      }))
    })

    game.currentQuestionIndex++

    setTimeout(() => {
      if (game.currentQuestionIndex < game.questions.length) {
        startNextQuestion(gameId)
      } else {
        endGame(gameId)
      }
    }, 5000)
  }

  function endGame(gameId) {
    const game = activeGames.get(gameId)
    if (!game) return

    game.status = 'finished'
    
    const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score)
    
    io.to(gameId).emit('game-ended', {
      finalScores: sortedPlayers,
      winner: sortedPlayers[0]
    })

    setTimeout(() => {
      activeGames.delete(gameId)
    }, 60000)
  }
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`)
})