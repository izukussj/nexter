import { Question } from '../entities/Question'

export interface QuestionRepository {
  getRandomQuestions(count: number, category?: string): Promise<Question[]>
  findById(id: string): Promise<Question | null>
  getAllCategories(): Promise<string[]>
}