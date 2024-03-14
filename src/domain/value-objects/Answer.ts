export class Answer {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Answer cannot be empty')
    }
  }

  static fromString(value: string): Answer {
    return new Answer(value.trim().toLowerCase())
  }

  getValue(): string {
    return this.value
  }

  equals(other: Answer): boolean {
    return this.value === other.value
  }

  matches(correctAnswer: string): boolean {
    return this.value === correctAnswer.trim().toLowerCase()
  }
}