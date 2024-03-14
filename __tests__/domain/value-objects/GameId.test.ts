import { GameId } from '@/domain/value-objects/GameId'

describe('GameId Value Object', () => {
  describe('Feature: Generate unique game identifiers', () => {
    describe('Scenario: Creating a new GameId', () => {
      it('Given the system needs a new game identifier, When I create a GameId, Then it should generate a unique ID with proper format', () => {
        // Given
        const existingIds = new Set<string>()
        
        // When
        const gameId1 = GameId.create()
        const gameId2 = GameId.create()
        
        // Then
        expect(gameId1.toString()).toBeDefined()
        expect(gameId2.toString()).toBeDefined()
        expect(gameId1.toString()).not.toBe(gameId2.toString())
        expect(gameId1.toString()).toMatch(/^game-\d+-[a-z0-9]+$/)
        expect(gameId2.toString()).toMatch(/^game-\d+-[a-z0-9]+$/)
      })
    })

    describe('Scenario: Creating GameId from existing string', () => {
      it('Given a valid game ID string, When I create a GameId from it, Then it should preserve the original value', () => {
        // Given
        const idString = 'game-123-abc'
        
        // When
        const gameId = GameId.fromString(idString)
        
        // Then
        expect(gameId.toString()).toBe(idString)
      })

      it('Given an empty string, When I try to create a GameId, Then it should throw an error', () => {
        // Given
        const emptyString = ''
        const whitespaceString = '   '
        
        // When & Then
        expect(() => GameId.fromString(emptyString)).toThrow('GameId cannot be empty')
        expect(() => GameId.fromString(whitespaceString)).toThrow('GameId cannot be empty')
      })
    })

    describe('Scenario: Comparing GameIds', () => {
      it('Given two GameIds with the same value, When I compare them, Then they should be equal', () => {
        // Given
        const id = 'game-123-abc'
        const gameId1 = GameId.fromString(id)
        const gameId2 = GameId.fromString(id)
        
        // When
        const areEqual = gameId1.equals(gameId2)
        
        // Then
        expect(areEqual).toBe(true)
      })

      it('Given two GameIds with different values, When I compare them, Then they should not be equal', () => {
        // Given
        const gameId1 = GameId.fromString('game-123-abc')
        const gameId2 = GameId.fromString('game-456-def')
        
        // When
        const areEqual = gameId1.equals(gameId2)
        
        // Then
        expect(areEqual).toBe(false)
      })
    })
  })
})