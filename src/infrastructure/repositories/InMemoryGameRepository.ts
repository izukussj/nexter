import { Game } from '../../domain/entities/Game'
import { GameId } from '../../domain/value-objects/GameId'
import { GameRepository } from '../../domain/ports/GameRepository'

export class InMemoryGameRepository implements GameRepository {
  private games = new Map<string, Game>()

  async save(game: Game): Promise<void> {
    this.games.set(game.getId().toString(), game)
  }

  async findById(id: GameId): Promise<Game | null> {
    return this.games.get(id.toString()) || null
  }

  async findByPlayerId(playerId: string): Promise<Game | null> {
    for (const game of this.games.values()) {
      if (game.getPlayer(playerId)) {
        return game
      }
    }
    return null
  }

  async delete(id: GameId): Promise<void> {
    this.games.delete(id.toString())
  }

  async findActiveGames(): Promise<Game[]> {
    return Array.from(this.games.values()).filter(game => !game.isFinished())
  }

  // Cleanup finished games (called periodically)
  cleanup(): void {
    const now = Date.now()
    for (const [id, game] of this.games.entries()) {
      if (game.isFinished()) {
        // Remove games that have been finished for more than 1 hour
        const gameAge = now - parseInt(id.split('-')[1] || '0')
        if (gameAge > 60 * 60 * 1000) {
          this.games.delete(id)
        }
      }
    }
  }
}