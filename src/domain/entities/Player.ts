import { PlayerId } from '../value-objects/PlayerId'
import { Score } from '../value-objects/Score'
import { Answer } from '../value-objects/Answer'

export interface PlayerData {
  id: string
  username: string
  timestamp?: Date
}

export class Player {
  private score: Score
  private hasAnsweredCurrentQuestion: boolean = false

  private constructor(
    private readonly id: PlayerId,
    private readonly username: string,
    private readonly timestamp: Date = new Date()
  ) {
    this.score = Score.zero()
  }

  static create(data: PlayerData): Player {
    if (!data.id || !data.username.trim()) {
      throw new Error('Invalid player data')
    }

    return new Player(
      PlayerId.fromString(data.id),
      data.username.trim(),
      data.timestamp || new Date()
    )
  }

  getId(): PlayerId {
    return this.id
  }

  getUsername(): string {
    return this.username
  }

  getScore(): Score {
    return this.score
  }

  getTimestamp(): Date {
    return this.timestamp
  }

  addScore(points: number): void {
    this.score = this.score.add(points)
  }

  markAsAnswered(): void {
    this.hasAnsweredCurrentQuestion = true
  }

  resetAnswerStatus(): void {
    this.hasAnsweredCurrentQuestion = false
  }

  hasAnswered(): boolean {
    return this.hasAnsweredCurrentQuestion
  }

  toPresentation() {
    return {
      id: this.id.toString(),
      username: this.username,
      score: this.score.getValue(),
      timestamp: this.timestamp,
      hasAnswered: this.hasAnsweredCurrentQuestion
    }
  }
}