import { Game } from '../entities/Game'
import { Player } from '../entities/Player'
import { Question } from '../entities/Question'

export interface GameEvent {
  type: string
  gameId: string
  timestamp: Date
}

export interface GameStartedEvent extends GameEvent {
  type: 'game_started'
  players: any[]
  gameType: string
  totalQuestions: number
}

export interface QuestionStartedEvent extends GameEvent {
  type: 'question_started'
  question: any
  questionNumber: number
  totalQuestions: number
  timeLimit: number
}

export interface AnswerSubmittedEvent extends GameEvent {
  type: 'answer_submitted'
  playerId: string
  username: string
  hasAnswered: boolean
}

export interface QuestionEndedEvent extends GameEvent {
  type: 'question_ended'
  correctAnswer: string
  category: string
  scores: any[]
}

export interface GameEndedEvent extends GameEvent {
  type: 'game_ended'
  finalScores: any[]
  winner: any
}

export interface TimerUpdateEvent extends GameEvent {
  type: 'timer_update'
  timeLeft: number
}

export interface GameEventPublisher {
  publishGameStarted(game: Game): Promise<void>
  publishQuestionStarted(game: Game, question: Question, timeLimit: number): Promise<void>
  publishAnswerSubmitted(game: Game, player: Player): Promise<void>
  publishQuestionEnded(game: Game, question: Question): Promise<void>
  publishGameEnded(game: Game): Promise<void>
  publishTimerUpdate(gameId: string, timeLeft: number): Promise<void>
}