import { StartGameUseCase, StartGameRequest } from '@/application/use-cases/StartGameUseCase'
import { GameRepository } from '@/domain/ports/GameRepository'
import { QuestionRepository } from '@/domain/ports/QuestionRepository'
import { GameEventPublisher } from '@/domain/ports/GameEventPublisher'
import { Question } from '@/domain/entities/Question'
import { Game } from '@/domain/entities/Game'

// Mocks
const mockGameRepository: jest.Mocked<GameRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByPlayerId: jest.fn(),
  delete: jest.fn(),
  findActiveGames: jest.fn()
}

const mockQuestionRepository: jest.Mocked<QuestionRepository> = {
  getRandomQuestions: jest.fn(),
  findById: jest.fn(),
  getAllCategories: jest.fn()
}

const mockEventPublisher: jest.Mocked<GameEventPublisher> = {
  publishGameStarted: jest.fn(),
  publishQuestionStarted: jest.fn(),
  publishAnswerSubmitted: jest.fn(),
  publishQuestionEnded: jest.fn(),
  publishGameEnded: jest.fn(),
  publishTimerUpdate: jest.fn()
}

describe('StartGameUseCase', () => {
  describe('Feature: Start a new quiz game', () => {
    let useCase: StartGameUseCase
    let mockQuestions: Question[]

    beforeEach(() => {
      jest.clearAllMocks()
      
      useCase = new StartGameUseCase(
        mockGameRepository,
        mockQuestionRepository,
        mockEventPublisher
      )

      mockQuestions = [
        Question.create({
          id: '1',
          text: 'What is 2+2?',
          correctAnswer: '4',
          category: 'Math'
        }),
        Question.create({
          id: '2',
          text: 'What is the capital of France?',
          correctAnswer: 'Paris',
          category: 'Geography'
        })
      ]

      mockQuestionRepository.getRandomQuestions.mockResolvedValue(mockQuestions)
    })

    describe('Scenario: Starting a game with valid players', () => {
      it('Given valid players and available questions, When I start a game, Then it should create and save the game successfully', async () => {
        // Given
        const request: StartGameRequest = {
          gameType: 'fun',
          players: [
            { id: 'player1', username: 'Alice' },
            { id: 'player2', username: 'Bob' }
          ]
        }

        // When
        const game = await useCase.execute(request)

        // Then
        expect(game).toBeInstanceOf(Game)
        expect(game.getStatus()).toBe('in_progress')
        expect(game.getPlayers()).toHaveLength(2)
        expect(mockQuestionRepository.getRandomQuestions).toHaveBeenCalledWith(5)
        expect(mockGameRepository.save).toHaveBeenCalledWith(game)
        expect(mockEventPublisher.publishGameStarted).toHaveBeenCalledWith(game)
      })
    })

    describe('Scenario: Starting a game with insufficient players', () => {
      it('Given only one player, When I try to start a game, Then it should throw an error', async () => {
        // Given
        const request: StartGameRequest = {
          gameType: 'fun',
          players: [
            { id: 'player1', username: 'Alice' }
          ]
        }

        // When & Then
        await expect(useCase.execute(request)).rejects.toThrow('Game requires at least 2 players')
        expect(mockGameRepository.save).not.toHaveBeenCalled()
        expect(mockEventPublisher.publishGameStarted).not.toHaveBeenCalled()
      })

      it('Given no players, When I try to start a game, Then it should throw an error', async () => {
        // Given
        const request: StartGameRequest = {
          gameType: 'competitive',
          players: []
        }

        // When & Then
        await expect(useCase.execute(request)).rejects.toThrow('Game requires at least 2 players')
        expect(mockGameRepository.save).not.toHaveBeenCalled()
        expect(mockEventPublisher.publishGameStarted).not.toHaveBeenCalled()
      })
    })

    describe('Scenario: Starting a competitive game', () => {
      it('Given players wanting to play competitively, When I start a competitive game, Then it should create a competitive game', async () => {
        // Given
        const request: StartGameRequest = {
          gameType: 'competitive',
          players: [
            { id: 'player1', username: 'Alice' },
            { id: 'player2', username: 'Bob' },
            { id: 'player3', username: 'Charlie' }
          ]
        }

        // When
        const game = await useCase.execute(request)

        // Then
        expect(game.toPresentation().gameType).toBe('competitive')
        expect(game.getPlayers()).toHaveLength(3)
        expect(mockQuestionRepository.getRandomQuestions).toHaveBeenCalledWith(5)
        expect(mockGameRepository.save).toHaveBeenCalledWith(game)
        expect(mockEventPublisher.publishGameStarted).toHaveBeenCalledWith(game)
      })
    })

    describe('Scenario: Error handling during game creation', () => {
      it('Given the question repository fails, When I try to start a game, Then it should propagate the error', async () => {
        // Given
        const request: StartGameRequest = {
          gameType: 'fun',
          players: [
            { id: 'player1', username: 'Alice' },
            { id: 'player2', username: 'Bob' }
          ]
        }
        const repositoryError = new Error('Failed to fetch questions')
        mockQuestionRepository.getRandomQuestions.mockRejectedValue(repositoryError)

        // When & Then
        await expect(useCase.execute(request)).rejects.toThrow('Failed to fetch questions')
        expect(mockGameRepository.save).not.toHaveBeenCalled()
        expect(mockEventPublisher.publishGameStarted).not.toHaveBeenCalled()
      })

      it('Given the game repository fails to save, When I try to start a game, Then it should propagate the error', async () => {
        // Given
        const request: StartGameRequest = {
          gameType: 'fun',
          players: [
            { id: 'player1', username: 'Alice' },
            { id: 'player2', username: 'Bob' }
          ]
        }
        const saveError = new Error('Failed to save game')
        mockGameRepository.save.mockRejectedValue(saveError)

        // When & Then
        await expect(useCase.execute(request)).rejects.toThrow('Failed to save game')
        expect(mockEventPublisher.publishGameStarted).not.toHaveBeenCalled()
      })
    })
  })
})