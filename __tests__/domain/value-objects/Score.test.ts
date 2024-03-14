import { Score } from '@/domain/value-objects/Score'

describe('Score Value Object', () => {
  describe('Feature: Manage player scores', () => {
    describe('Scenario: Creating a new score', () => {
      it('Given I need to start a player score, When I create a zero score, Then it should be initialized to 0', () => {
        // Given
        const expectedValue = 0
        
        // When
        const score = Score.zero()
        
        // Then
        expect(score.getValue()).toBe(expectedValue)
      })

      it('Given I have a specific score value, When I create a score from that number, Then it should preserve the value', () => {
        // Given
        const value = 150
        
        // When
        const score = Score.fromNumber(value)
        
        // Then
        expect(score.getValue()).toBe(value)
      })

      it('Given I try to create a negative score, When I create it, Then it should throw an error', () => {
        // Given
        const negativeValue = -10
        
        // When & Then
        expect(() => Score.fromNumber(negativeValue)).toThrow('Score cannot be negative')
      })
    })

    describe('Scenario: Adding points to a score', () => {
      it('Given a player has 50 points, When they earn 25 more points, Then their score should be 75', () => {
        // Given
        const initialScore = Score.fromNumber(50)
        const pointsToAdd = 25
        
        // When
        const newScore = initialScore.add(pointsToAdd)
        
        // Then
        expect(newScore.getValue()).toBe(75)
        expect(initialScore.getValue()).toBe(50) // Original should remain unchanged
      })

      it('Given a player has 0 points, When they earn 100 points, Then their score should be 100', () => {
        // Given
        const initialScore = Score.zero()
        const pointsToAdd = 100
        
        // When
        const newScore = initialScore.add(pointsToAdd)
        
        // Then
        expect(newScore.getValue()).toBe(100)
      })

      it('Given a player has some points, When I try to add negative points, Then it should throw an error', () => {
        // Given
        const score = Score.fromNumber(50)
        const negativePoints = -10
        
        // When & Then
        expect(() => score.add(negativePoints)).toThrow('Cannot add negative points')
      })
    })

    describe('Scenario: Comparing scores', () => {
      it('Given two players with the same score, When I compare their scores, Then they should be equal', () => {
        // Given
        const score1 = Score.fromNumber(100)
        const score2 = Score.fromNumber(100)
        
        // When
        const areEqual = score1.equals(score2)
        
        // Then
        expect(areEqual).toBe(true)
      })

      it('Given player A has 150 points and player B has 100 points, When I compare their scores, Then player A should have a higher score', () => {
        // Given
        const playerAScore = Score.fromNumber(150)
        const playerBScore = Score.fromNumber(100)
        
        // When
        const isPlayerAHigher = playerAScore.isGreaterThan(playerBScore)
        const isPlayerBHigher = playerBScore.isGreaterThan(playerAScore)
        
        // Then
        expect(isPlayerAHigher).toBe(true)
        expect(isPlayerBHigher).toBe(false)
        expect(playerAScore.equals(playerBScore)).toBe(false)
      })

      it('Given two players with equal scores, When I check if one is greater than the other, Then it should be false', () => {
        // Given
        const score1 = Score.fromNumber(75)
        const score2 = Score.fromNumber(75)
        
        // When
        const isFirstGreater = score1.isGreaterThan(score2)
        const isSecondGreater = score2.isGreaterThan(score1)
        
        // Then
        expect(isFirstGreater).toBe(false)
        expect(isSecondGreater).toBe(false)
      })
    })
  })
})