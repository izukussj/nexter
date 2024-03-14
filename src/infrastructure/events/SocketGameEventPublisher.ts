import { Server } from 'socket.io'
import { Game } from '../../domain/entities/Game'
import { Player } from '../../domain/entities/Player'
import { Question } from '../../domain/entities/Question'
import { GameEventPublisher } from '../../domain/ports/GameEventPublisher'

export class SocketGameEventPublisher implements GameEventPublisher {
  constructor(private io: Server) {}

  async publishGameStarted(game: Game): Promise<void> {
    const gameId = game.getId().toString()
    
    this.io.to(gameId).emit('game-started', {
      gameId,
      players: game.getPlayers().map(p => p.toPresentation()),
      gameType: game.toPresentation().gameType,
      totalQuestions: game.toPresentation().totalQuestions
    })

    console.log(`Published game-started event for game ${gameId}`)
  }

  async publishQuestionStarted(game: Game, question: Question, timeLimit: number): Promise<void> {
    const gameId = game.getId().toString()
    const gamePresentation = game.toPresentation()
    
    this.io.to(gameId).emit('new-question', {
      question: question.toPresentation(),
      questionNumber: gamePresentation.currentQuestionIndex + 1,
      totalQuestions: gamePresentation.totalQuestions,
      timeLimit
    })

    console.log(`Published new-question event for game ${gameId}`)
  }

  async publishAnswerSubmitted(game: Game, player: Player): Promise<void> {
    const gameId = game.getId().toString()
    
    this.io.to(gameId).emit('answer-submitted', {
      playerId: player.getId().toString(),
      username: player.getUsername(),
      hasAnswered: player.hasAnswered()
    })

    console.log(`Published answer-submitted event for player ${player.getUsername()}`)
  }

  async publishQuestionEnded(game: Game, question: Question): Promise<void> {
    const gameId = game.getId().toString()
    
    this.io.to(gameId).emit('question-ended', {
      correctAnswer: question.getCorrectAnswer(),
      category: question.getCategory(),
      scores: game.getPlayers().map(p => ({
        id: p.getId().toString(),
        username: p.getUsername(),
        score: p.getScore().getValue()
      }))
    })

    console.log(`Published question-ended event for game ${gameId}`)
  }

  async publishGameEnded(game: Game): Promise<void> {
    const gameId = game.getId().toString()
    const rankedPlayers = game.getRankedPlayers()
    
    this.io.to(gameId).emit('game-ended', {
      finalScores: rankedPlayers.map(p => p.toPresentation()),
      winner: rankedPlayers[0]?.toPresentation() || null
    })

    console.log(`Published game-ended event for game ${gameId}`)
  }

  async publishTimerUpdate(gameId: string, timeLeft: number): Promise<void> {
    this.io.to(gameId).emit('timer-update', { timeLeft })
  }
}