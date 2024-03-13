import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { Server as NetServer } from 'http'
import { NextApiResponseServerIo } from '@/lib/socket'
import { getRandomQuestions } from '@/lib/demo-questions'

interface GameState {
  gameId: string
  players: Array<{ id: string, username: string, score: number }>
  questions: any[]
  currentQuestionIndex: number
  gameType: 'fun' | 'competitive'
  status: 'waiting' | 'playing' | 'finished'
  questionStartTime?: number
  answers: Map<string, { answer: string, timestamp: number }>
}

const activeGames = new Map<string, GameState>()

export default function ioHandler(req: NextApiRequest, res: NextApiResponseServerIo) {
  if (!res.socket.server.io) {
    const path = '/api/socket/io'
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    })

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id)

      socket.on('join-lobby', (data: { gameType: 'fun' | 'competitive', username?: string }) => {
        const lobbyRoom = `lobby-${data.gameType}`
        socket.join(lobbyRoom)
        
        socket.emit('joined-lobby', {
          room: lobbyRoom,
          message: `Joined ${data.gameType} lobby`
        })

        io.to(lobbyRoom).emit('player-joined', {
          playerId: socket.id,
          username: data.username || `Player-${socket.id.slice(0, 6)}`,
          timestamp: new Date()
        })
      })

      socket.on('leave-lobby', (data: { gameType: 'fun' | 'competitive' }) => {
        const lobbyRoom = `lobby-${data.gameType}`
        socket.leave(lobbyRoom)
        
        io.to(lobbyRoom).emit('player-left', {
          playerId: socket.id,
          timestamp: new Date()
        })
      })

      socket.on('start-game', (data: { gameType: 'fun' | 'competitive', players: any[] }) => {
        const gameRoom = `game-${Date.now()}`
        const questions = getRandomQuestions(5)
        
        const gameState: GameState = {
          gameId: gameRoom,
          players: data.players.map(p => ({ ...p, score: 0 })),
          questions,
          currentQuestionIndex: 0,
          gameType: data.gameType,
          status: 'waiting',
          answers: new Map()
        }
        
        activeGames.set(gameRoom, gameState)
        
        data.players.forEach(player => {
          const playerSocket = io.sockets.sockets.get(player.id)
          if (playerSocket) {
            playerSocket.join(gameRoom)
          }
        })

        io.to(gameRoom).emit('game-started', {
          gameId: gameRoom,
          players: gameState.players,
          gameType: data.gameType,
          totalQuestions: questions.length
        })

        setTimeout(() => {
          startNextQuestion(io, gameRoom)
        }, 3000)
      })

      socket.on('submit-answer', (data: { gameId: string, answer: string, questionId: string }) => {
        const game = activeGames.get(data.gameId)
        if (!game || game.status !== 'playing') return

        const currentQuestion = game.questions[game.currentQuestionIndex]
        if (currentQuestion.id !== data.questionId) return

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
          endQuestion(io, data.gameId)
        }
      })

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })

    function startNextQuestion(io: ServerIO, gameId: string) {
      const game = activeGames.get(gameId)
      if (!game) return

      if (game.currentQuestionIndex >= game.questions.length) {
        endGame(io, gameId)
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

      setTimeout(() => {
        endQuestion(io, gameId)
      }, 30000)
    }

    function endQuestion(io: ServerIO, gameId: string) {
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
          startNextQuestion(io, gameId)
        } else {
          endGame(io, gameId)
        }
      }, 5000)
    }

    function endGame(io: ServerIO, gameId: string) {
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

    res.socket.server.io = io
  }

  res.end()
}

export const config = {
  api: {
    bodyParser: false,
  },
}