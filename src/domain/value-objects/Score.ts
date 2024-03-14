export class Score {
  private constructor(private readonly value: number) {
    if (value < 0) {
      throw new Error('Score cannot be negative')
    }
  }

  static zero(): Score {
    return new Score(0)
  }

  static fromNumber(value: number): Score {
    return new Score(value)
  }

  add(points: number): Score {
    if (points < 0) {
      throw new Error('Cannot add negative points')
    }
    return new Score(this.value + points)
  }

  getValue(): number {
    return this.value
  }

  equals(other: Score): boolean {
    return this.value === other.value
  }

  isGreaterThan(other: Score): boolean {
    return this.value > other.value
  }
}