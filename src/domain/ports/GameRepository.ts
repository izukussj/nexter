import { Game } from '../entities/Game'
import { GameId } from '../value-objects/GameId'

export interface GameRepository {
  save(game: Game): Promise<void>
  findById(id: GameId): Promise<Game | null>
  findByPlayerId(playerId: string): Promise<Game | null>
  delete(id: GameId): Promise<void>
  findActiveGames(): Promise<Game[]>
}