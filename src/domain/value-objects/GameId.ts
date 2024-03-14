export class GameId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('GameId cannot be empty')
    }
  }

  static create(): GameId {
    return new GameId(`game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  }

  static fromString(value: string): GameId {
    return new GameId(value)
  }

  toString(): string {
    return this.value
  }

  equals(other: GameId): boolean {
    return this.value === other.value
  }
}