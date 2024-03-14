import { StartGameUseCase, StartGameRequest } from '../use-cases/StartGameUseCase'
import { SubmitAnswerUseCase, SubmitAnswerRequest } from '../use-cases/SubmitAnswerUseCase'
import { StartQuestionUseCase } from '../use-cases/StartQuestionUseCase'
import { GameRepository } from '../../domain/ports/GameRepository'
import { QuestionRepository } from '../../domain/ports/QuestionRepository'
import { GameEventPublisher } from '../../domain/ports/GameEventPublisher'

export class GameService {
  private startGameUseCase: StartGameUseCase
  private submitAnswerUseCase: SubmitAnswerUseCase
  private startQuestionUseCase: StartQuestionUseCase

  constructor(
    gameRepository: GameRepository,
    questionRepository: QuestionRepository,
    eventPublisher: GameEventPublisher
  ) {
    this.startGameUseCase = new StartGameUseCase(gameRepository, questionRepository, eventPublisher)
    this.submitAnswerUseCase = new SubmitAnswerUseCase(gameRepository, eventPublisher)
    this.startQuestionUseCase = new StartQuestionUseCase(gameRepository, eventPublisher)
  }

  async startGame(request: StartGameRequest) {
    const game = await this.startGameUseCase.execute(request)
    
    // Start first question after 3 seconds
    setTimeout(async () => {
      await this.startQuestionUseCase.execute({ gameId: game.getId().toString() })
    }, 3000)

    return game
  }

  async submitAnswer(request: SubmitAnswerRequest) {
    const result = await this.submitAnswerUseCase.execute(request)
    
    // If all players answered, end the question immediately
    if (result.allPlayersAnswered) {
      // Small delay to let the UI update
      setTimeout(async () => {
        await this.endCurrentQuestion(request.gameId)
      }, 1000)
    }

    return result
  }

  private async endCurrentQuestion(gameId: string) {
    // This will be handled by the timer in StartQuestionUseCase
    // But we can trigger it early if all players answered
  }
}