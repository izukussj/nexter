import { Game, GameType } from '../../domain/entities/Game'
import { Player } from '../../domain/entities/Player'
import { Question } from '../../domain/entities/Question'
import { GameRepository } from '../../domain/ports/GameRepository'
import { QuestionRepository } from '../../domain/ports/QuestionRepository'
import { GameEventPublisher } from '../../domain/ports/GameEventPublisher'

export interface StartGameRequest {
  gameType: GameType
  players: Array<{
    id: string
    username: string
  }>
}

export class StartGameUseCase {
  constructor(
    private gameRepository: GameRepository,
    private questionRepository: QuestionRepository,
    private eventPublisher: GameEventPublisher
  ) {}

  async execute(request: StartGameRequest): Promise<Game> {
    if (request.players.length < 2) {
      throw new Error('Game requires at least 2 players')
    }

    // Get random questions
    const questions = await this.questionRepository.getRandomQuestions(5)
    
    // Create players
    const players = request.players.map(playerData => 
      Player.create({
        id: playerData.id,
        username: playerData.username,
        timestamp: new Date()
      })
    )

    // Create game
    const game = Game.create({
      gameType: request.gameType,
      questions,
      players
    })

    // Start the game
    game.startGame()

    // Save game
    await this.gameRepository.save(game)

    // Publish event
    await this.eventPublisher.publishGameStarted(game)

    return game
  }
}