import { GameId } from '../value-objects/GameId'
import { Player } from './Player'
import { Question } from './Question'
import { Answer } from '../value-objects/Answer'

export type GameStatus = 'waiting' | 'in_progress' | 'question_ended' | 'finished'
export type GameType = 'fun' | 'competitive'

export interface GameData {
  gameType: GameType
  questions: Question[]
  players: Player[]
}

export class Game {
  private status: GameStatus = 'waiting'
  private currentQuestionIndex: number = -1
  private questionStartTime: Date | null = null

  private constructor(
    private readonly id: GameId,
    private readonly gameType: GameType,
    private readonly questions: Question[],
    private readonly players: Map<string, Player>
  ) {}

  static create(data: GameData): Game {
    if (!data.questions.length) {
      throw new Error('Game must have at least one question')
    }
    if (!data.players.length) {
      throw new Error('Game must have at least one player')
    }

    const playersMap = new Map<string, Player>()
    data.players.forEach(player => {
      playersMap.set(player.getId().toString(), player)
    })

    return new Game(
      GameId.create(),
      data.gameType,
      data.questions,
      playersMap
    )
  }

  getId(): GameId {
    return this.id
  }

  getStatus(): GameStatus {
    return this.status
  }

  getCurrentQuestion(): Question | null {
    if (this.currentQuestionIndex < 0 || this.currentQuestionIndex >= this.questions.length) {
      return null
    }
    return this.questions[this.currentQuestionIndex]
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values())
  }

  getPlayer(playerId: string): Player | null {
    return this.players.get(playerId) || null
  }

  startGame(): void {
    if (this.status !== 'waiting') {
      throw new Error('Game is already started')
    }
    this.status = 'in_progress'
  }

  startQuestion(): void {
    if (this.status !== 'in_progress') {
      throw new Error('Cannot start question when game is not in progress')
    }
    
    // Move to next question if we don't have a current one
    if (this.getCurrentQuestion() === null) {
      this.moveToNextQuestion()
      if (this.getCurrentQuestion() === null) {
        this.finishGame()
        return
      }
    }

    this.questionStartTime = new Date()
    
    // Reset all players' answer status
    this.players.forEach(player => player.resetAnswerStatus())
  }

  submitAnswer(playerId: string, answer: Answer): boolean {
    const player = this.getPlayer(playerId)
    if (!player) {
      throw new Error('Player not found')
    }

    if (player.hasAnswered()) {
      throw new Error('Player has already answered')
    }

    if (this.status !== 'in_progress') {
      throw new Error('Game is not accepting answers')
    }

    const currentQuestion = this.getCurrentQuestion()
    if (!currentQuestion) {
      throw new Error('No current question')
    }

    const isCorrect = currentQuestion.checkAnswer(answer)
    player.markAsAnswered()

    if (isCorrect) {
      // Calculate time bonus (max 10 seconds, 1 point per second)
      const timeElapsed = this.questionStartTime 
        ? (Date.now() - this.questionStartTime.getTime()) / 1000
        : 30
      const timeBonus = Math.max(0, 10 - Math.floor(timeElapsed))
      player.addScore(10 + timeBonus)
    }

    return isCorrect
  }

  allPlayersAnswered(): boolean {
    return Array.from(this.players.values()).every(player => player.hasAnswered())
  }

  endCurrentQuestion(): void {
    this.status = 'question_ended'
  }

  moveToNextQuestion(): void {
    this.currentQuestionIndex++
    
    if (this.currentQuestionIndex >= this.questions.length) {
      this.finishGame()
    } else {
      this.status = 'in_progress'
    }
  }

  private finishGame(): void {
    this.status = 'finished'
  }

  isFinished(): boolean {
    return this.status === 'finished'
  }

  getWinner(): Player | null {
    if (this.status !== 'finished') {
      return null
    }

    let winner: Player | null = null
    let highestScore = -1

    this.players.forEach(player => {
      const score = player.getScore().getValue()
      if (score > highestScore) {
        highestScore = score
        winner = player
      }
    })

    return winner
  }

  getRankedPlayers(): Player[] {
    return Array.from(this.players.values()).sort((a, b) => 
      b.getScore().getValue() - a.getScore().getValue()
    )
  }

  toPresentation() {
    return {
      id: this.id.toString(),
      gameType: this.gameType,
      status: this.status,
      currentQuestionIndex: this.currentQuestionIndex,
      totalQuestions: this.questions.length,
      currentQuestion: this.getCurrentQuestion()?.toPresentation() || null,
      players: this.getPlayers().map(p => p.toPresentation())
    }
  }
}