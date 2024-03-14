import { Answer } from '../../domain/value-objects/Answer'
import { GameId } from '../../domain/value-objects/GameId'
import { GameRepository } from '../../domain/ports/GameRepository'
import { GameEventPublisher } from '../../domain/ports/GameEventPublisher'

export interface SubmitAnswerRequest {
  gameId: string
  playerId: string
  answer: string
  questionId: string
}

export interface SubmitAnswerResponse {
  isCorrect: boolean
  allPlayersAnswered: boolean
}

export class SubmitAnswerUseCase {
  constructor(
    private gameRepository: GameRepository,
    private eventPublisher: GameEventPublisher
  ) {}

  async execute(request: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    const gameId = GameId.fromString(request.gameId)
    const game = await this.gameRepository.findById(gameId)
    
    if (!game) {
      throw new Error('Game not found')
    }

    if (game.getStatus() !== 'in_progress') {
      throw new Error('Game is not accepting answers')
    }

    const currentQuestion = game.getCurrentQuestion()
    if (!currentQuestion || currentQuestion.getId() !== request.questionId) {
      throw new Error('Invalid question')
    }

    const player = game.getPlayer(request.playerId)
    if (!player) {
      throw new Error('Player not found in game')
    }

    const answer = Answer.fromString(request.answer)
    const isCorrect = game.submitAnswer(request.playerId, answer)

    // Save updated game state
    await this.gameRepository.save(game)

    // Publish answer submitted event
    await this.eventPublisher.publishAnswerSubmitted(game, player)

    const allPlayersAnswered = game.allPlayersAnswered()

    return {
      isCorrect,
      allPlayersAnswered
    }
  }
}