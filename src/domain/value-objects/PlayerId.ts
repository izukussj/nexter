export class PlayerId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('PlayerId cannot be empty')
    }
  }

  static fromString(value: string): PlayerId {
    return new PlayerId(value)
  }

  toString(): string {
    return this.value
  }

  equals(other: PlayerId): boolean {
    return this.value === other.value
  }
}