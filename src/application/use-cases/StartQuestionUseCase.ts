import { GameId } from '../../domain/value-objects/GameId'
import { GameRepository } from '../../domain/ports/GameRepository'
import { GameEventPublisher } from '../../domain/ports/GameEventPublisher'

export interface StartQuestionRequest {
  gameId: string
}

export class StartQuestionUseCase {
  constructor(
    private gameRepository: GameRepository,
    private eventPublisher: GameEventPublisher
  ) {}

  async execute(request: StartQuestionRequest): Promise<void> {
    const gameId = GameId.fromString(request.gameId)
    const game = await this.gameRepository.findById(gameId)
    
    if (!game) {
      throw new Error('Game not found')
    }

    if (game.isFinished()) {
      await this.eventPublisher.publishGameEnded(game)
      return
    }

    const currentQuestion = game.getCurrentQuestion()
    if (!currentQuestion) {
      game.endCurrentQuestion()
      await this.gameRepository.save(game)
      await this.eventPublisher.publishGameEnded(game)
      return
    }

    // Start the question
    game.startQuestion()
    await this.gameRepository.save(game)

    // Publish question started event
    await this.eventPublisher.publishQuestionStarted(game, currentQuestion, 30)

    // Start timer (30 seconds)
    this.startTimer(request.gameId, 30)
  }

  private startTimer(gameId: string, timeLimit: number): void {
    let timeLeft = timeLimit
    
    const timerInterval = setInterval(async () => {
      timeLeft--
      await this.eventPublisher.publishTimerUpdate(gameId, timeLeft)
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval)
        await this.endQuestion(gameId)
      }
    }, 1000)
  }

  private async endQuestion(gameId: string): Promise<void> {
    const game = await this.gameRepository.findById(GameId.fromString(gameId))
    if (!game) return

    const currentQuestion = game.getCurrentQuestion()
    if (currentQuestion) {
      game.endCurrentQuestion()
      await this.gameRepository.save(game)
      await this.eventPublisher.publishQuestionEnded(game, currentQuestion)

      // Move to next question after delay
      setTimeout(async () => {
        game.moveToNextQuestion()
        await this.gameRepository.save(game)
        
        if (game.isFinished()) {
          await this.eventPublisher.publishGameEnded(game)
        } else {
          await this.execute({ gameId })
        }
      }, 5000)
    }
  }
}