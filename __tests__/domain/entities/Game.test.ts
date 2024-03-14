import { Game } from '@/domain/entities/Game'
import { Player } from '@/domain/entities/Player'
import { Question } from '@/domain/entities/Question'
import { Answer } from '@/domain/value-objects/Answer'

describe('Game Entity', () => {
  describe('Feature: Manage quiz game lifecycle', () => {
    let mockQuestions: Question[]
    let mockPlayers: Player[]

    beforeEach(() => {
      // Given some mock questions and players for testing
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

      mockPlayers = [
        Player.create({ id: 'player1', username: 'Alice' }),
        Player.create({ id: 'player2', username: 'Bob' })
      ]
    })

    describe('Scenario: Creating a new game', () => {
      it('Given valid questions and players, When I create a game, Then it should initialize properly', () => {
        // Given
        const gameData = {
          gameType: 'fun' as const,
          questions: mockQuestions,
          players: mockPlayers
        }

        // When
        const game = Game.create(gameData)

        // Then
        expect(game.getId()).toBeDefined()
        expect(game.getStatus()).toBe('waiting')
        expect(game.getPlayers()).toHaveLength(2)
        expect(game.getCurrentQuestion()).toBeNull()
      })

      it('Given no questions, When I try to create a game, Then it should throw an error', () => {
        // Given
        const gameData = {
          gameType: 'fun' as const,
          questions: [],
          players: mockPlayers
        }

        // When & Then
        expect(() => Game.create(gameData)).toThrow('Game must have at least one question')
      })

      it('Given no players, When I try to create a game, Then it should throw an error', () => {
        // Given
        const gameData = {
          gameType: 'fun' as const,
          questions: mockQuestions,
          players: []
        }

        // When & Then
        expect(() => Game.create(gameData)).toThrow('Game must have at least one player')
      })
    })

    describe('Scenario: Starting a game', () => {
      it('Given a waiting game, When I start the game, Then its status should change to in_progress', () => {
        // Given
        const game = Game.create({
          gameType: 'fun',
          questions: mockQuestions,
          players: mockPlayers
        })
        expect(game.getStatus()).toBe('waiting')

        // When
        game.startGame()

        // Then
        expect(game.getStatus()).toBe('in_progress')
      })

      it('Given an already started game, When I try to start it again, Then it should throw an error', () => {
        // Given
        const game = Game.create({
          gameType: 'fun',
          questions: mockQuestions,
          players: mockPlayers
        })
        game.startGame()

        // When & Then
        expect(() => game.startGame()).toThrow('Game is already started')
      })
    })

    describe('Scenario: Managing game questions', () => {
      it('Given a game with questions, When I start a question, Then the current question should be available', () => {
        // Given
        const game = Game.create({
          gameType: 'fun',
          questions: mockQuestions,
          players: mockPlayers
        })
        game.startGame()

        // When
        game.startQuestion()

        // Then
        const currentQuestion = game.getCurrentQuestion()
        expect(currentQuestion).toBe(mockQuestions[0])
        expect(game.getPlayers().every(p => !p.hasAnswered())).toBe(true)
      })

      it('Given a non-playing game, When I try to start a question, Then it should throw an error', () => {
        // Given
        const game = Game.create({
          gameType: 'fun',
          questions: mockQuestions,
          players: mockPlayers
        })

        // When & Then
        expect(() => game.startQuestion()).toThrow('Cannot start question when game is not in progress')
      })
    })

    describe('Scenario: Submitting answers', () => {
      it('Given a player in an active game, When they submit a correct answer, Then their score should increase', () => {
        // Given
        const game = Game.create({
          gameType: 'fun',
          questions: mockQuestions,
          players: mockPlayers
        })
        game.startGame()
        game.startQuestion()
        
        const player = game.getPlayer('player1')
        const initialScore = player?.getScore().getValue() || 0
        const correctAnswer = Answer.fromString('4')

        // When
        const isCorrect = game.submitAnswer('player1', correctAnswer)

        // Then
        expect(isCorrect).toBe(true)
        expect(player?.hasAnswered()).toBe(true)
        expect(player?.getScore().getValue()).toBeGreaterThan(initialScore)
      })

      it('Given a player in an active game, When they submit an incorrect answer, Then their score should not change', () => {
        // Given
        const game = Game.create({
          gameType: 'fun',
          questions: mockQuestions,
          players: mockPlayers
        })
        game.startGame()
        game.startQuestion()
        
        const player = game.getPlayer('player1')
        const initialScore = player?.getScore().getValue() || 0
        const wrongAnswer = Answer.fromString('5')

        // When
        const isCorrect = game.submitAnswer('player1', wrongAnswer)

        // Then
        expect(isCorrect).toBe(false)
        expect(player?.hasAnswered()).toBe(true)
        expect(player?.getScore().getValue()).toBe(initialScore)
      })

      it('Given a player who already answered, When they try to answer again, Then it should throw an error', () => {
        // Given
        const game = Game.create({
          gameType: 'fun',
          questions: mockQuestions,
          players: mockPlayers
        })
        game.startGame()
        game.startQuestion()
        
        const firstAnswer = Answer.fromString('4')
        game.submitAnswer('player1', firstAnswer)

        // When & Then
        const secondAnswer = Answer.fromString('5')
        expect(() => game.submitAnswer('player1', secondAnswer))
          .toThrow('Player has already answered')
      })
    })

    describe('Scenario: Determining game completion', () => {
      it('Given all players have answered the current question, When I check if all answered, Then it should return true', () => {
        // Given
        const game = Game.create({
          gameType: 'fun',
          questions: mockQuestions,
          players: mockPlayers
        })
        game.startGame()
        game.startQuestion()

        // When
        game.submitAnswer('player1', Answer.fromString('4'))
        game.submitAnswer('player2', Answer.fromString('5'))

        // Then
        expect(game.allPlayersAnswered()).toBe(true)
      })

      it('Given only some players have answered, When I check if all answered, Then it should return false', () => {
        // Given
        const game = Game.create({
          gameType: 'fun',
          questions: mockQuestions,
          players: mockPlayers
        })
        game.startGame()
        game.startQuestion()

        // When
        game.submitAnswer('player1', Answer.fromString('4'))

        // Then
        expect(game.allPlayersAnswered()).toBe(false)
      })
    })

    describe('Scenario: Game ending and winners', () => {
      it('Given a finished game with different scores, When I get the winner, Then it should return the highest scoring player', () => {
        // Given
        const game = Game.create({
          gameType: 'fun',
          questions: [mockQuestions[0]], // Only one question
          players: mockPlayers
        })
        game.startGame()
        game.startQuestion()
        
        // Player 1 answers correctly, Player 2 answers incorrectly
        game.submitAnswer('player1', Answer.fromString('4'))
        game.submitAnswer('player2', Answer.fromString('wrong'))
        
        game.endCurrentQuestion()
        game.moveToNextQuestion() // This should finish the game

        // When
        const winner = game.getWinner()
        const rankedPlayers = game.getRankedPlayers()

        // Then
        expect(game.isFinished()).toBe(true)
        expect(winner?.getUsername()).toBe('Alice')
        expect(rankedPlayers[0].getUsername()).toBe('Alice')
        expect(rankedPlayers[1].getUsername()).toBe('Bob')
      })
    })
  })
})