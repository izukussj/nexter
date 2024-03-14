import { Answer } from '../value-objects/Answer'

export interface QuestionData {
  id: string
  text: string
  correctAnswer: string
  category: string
  imageUrl?: string
  videoUrl?: string
}

export class Question {
  private constructor(
    private readonly id: string,
    private readonly text: string,
    private readonly correctAnswer: string,
    private readonly category: string,
    private readonly imageUrl?: string,
    private readonly videoUrl?: string
  ) {}

  static create(data: QuestionData): Question {
    if (!data.id || !data.text || !data.correctAnswer || !data.category) {
      throw new Error('Invalid question data')
    }

    return new Question(
      data.id,
      data.text,
      data.correctAnswer,
      data.category,
      data.imageUrl,
      data.videoUrl
    )
  }

  getId(): string {
    return this.id
  }

  getText(): string {
    return this.text
  }

  getCategory(): string {
    return this.category
  }

  getImageUrl(): string | undefined {
    return this.imageUrl
  }

  getVideoUrl(): string | undefined {
    return this.videoUrl
  }

  checkAnswer(answer: Answer): boolean {
    return answer.matches(this.correctAnswer)
  }

  getCorrectAnswer(): string {
    return this.correctAnswer
  }

  toPresentation() {
    return {
      id: this.id,
      text: this.text,
      category: this.category,
      imageUrl: this.imageUrl,
      videoUrl: this.videoUrl
    }
  }
}