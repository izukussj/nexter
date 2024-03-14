'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useSocket } from '@/hooks/useSocket'

// Types pour le state du jeu
export type GamePhase = 'lobby' | 'waiting' | 'playing' | 'question_ended' | 'game_ended'

export interface Player {
  id: string
  username: string
  score: number
  hasAnswered?: boolean
  timestamp: Date
}

export interface Question {
  id: string
  text: string
  category: string
  imageUrl?: string
  videoUrl?: string
}

export interface GameState {
  // Navigation state
  gamePhase: GamePhase
  gameId: string | null
  
  // Lobby state
  lobbyPlayers: Player[]
  isInLobby: boolean
  
  // Game state
  currentQuestion: Question | null
  questionNumber: number
  totalQuestions: number
  timeLeft: number
  players: Player[]
  
  // User interaction
  answer: string
  hasAnswered: boolean
  
  // Results
  correctAnswer: string
  winner: Player | null
  finalScores: Player[]
  
  // Meta
  loading: boolean
  error: string | null
}

const initialState: GameState = {
  gamePhase: 'lobby',
  gameId: null,
  lobbyPlayers: [],
  isInLobby: false,
  currentQuestion: null,
  questionNumber: 0,
  totalQuestions: 0,
  timeLeft: 30,
  players: [],
  answer: '',
  hasAnswered: false,
  correctAnswer: '',
  winner: null,
  finalScores: [],
  loading: false,
  error: null
}

// Actions
type GameAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'JOIN_LOBBY_SUCCESS'; payload: { room: string } }
  | { type: 'LOBBY_UPDATE'; payload: { players: any[] } }
  | { type: 'LEAVE_LOBBY' }
  | { type: 'GAME_STARTED'; payload: { gameId: string; players: Player[]; totalQuestions: number } }
  | { type: 'NEW_QUESTION'; payload: { question: Question; questionNumber: number; totalQuestions: number; timeLimit: number } }
  | { type: 'TIMER_UPDATE'; payload: { timeLeft: number } }
  | { type: 'SET_ANSWER'; payload: string }
  | { type: 'ANSWER_SUBMITTED' }
  | { type: 'QUESTION_ENDED'; payload: { correctAnswer: string; scores: Player[] } }
  | { type: 'GAME_ENDED'; payload: { finalScores: Player[]; winner: Player | null } }
  | { type: 'RESET_GAME' }

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'JOIN_LOBBY_SUCCESS':
      return { 
        ...state, 
        isInLobby: true, 
        gamePhase: 'lobby',
        error: null
      }
    
    case 'LOBBY_UPDATE':
      return {
        ...state,
        lobbyPlayers: action.payload.players.map(p => ({
          id: p.playerId,
          username: p.username,
          score: 0,
          timestamp: new Date(p.timestamp)
        }))
      }
    
    case 'LEAVE_LOBBY':
      return {
        ...state,
        isInLobby: false,
        lobbyPlayers: [],
        gamePhase: 'lobby'
      }
    
    case 'GAME_STARTED':
      return {
        ...state,
        gamePhase: 'waiting',
        gameId: action.payload.gameId,
        players: action.payload.players,
        totalQuestions: action.payload.totalQuestions,
        currentQuestion: null,
        questionNumber: 0
      }
    
    case 'NEW_QUESTION':
      return {
        ...state,
        gamePhase: 'playing',
        currentQuestion: action.payload.question,
        questionNumber: action.payload.questionNumber,
        totalQuestions: action.payload.totalQuestions,
        timeLeft: action.payload.timeLimit,
        answer: '',
        hasAnswered: false,
        correctAnswer: ''
      }
    
    case 'TIMER_UPDATE':
      return {
        ...state,
        timeLeft: action.payload.timeLeft
      }
    
    case 'SET_ANSWER':
      return {
        ...state,
        answer: action.payload
      }
    
    case 'ANSWER_SUBMITTED':
      return {
        ...state,
        hasAnswered: true
      }
    
    case 'QUESTION_ENDED':
      return {
        ...state,
        gamePhase: 'question_ended',
        correctAnswer: action.payload.correctAnswer,
        players: action.payload.scores
      }
    
    case 'GAME_ENDED':
      return {
        ...state,
        gamePhase: 'game_ended',
        finalScores: action.payload.finalScores,
        winner: action.payload.winner
      }
    
    case 'RESET_GAME':
      return {
        ...initialState,
        gamePhase: 'lobby'
      }
    
    default:
      return state
  }
}

// Context
interface GameContextType {
  state: GameState
  actions: {
    joinLobby: (gameType: string, username: string) => void
    leaveLobby: (gameType: string) => void
    startGame: (gameType: string, players: any[]) => void
    submitAnswer: (answer: string) => void
    setAnswer: (answer: string) => void
    resetGame: () => void
  }
}

const GameContext = createContext<GameContextType | null>(null)

// Provider
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const { socket, isConnected } = useSocket()

  // Socket event handlers
  useEffect(() => {
    if (!socket) return

    const handlers = {
      'joined-lobby': (data: any) => {
        console.log('Joined lobby:', data)
        dispatch({ type: 'JOIN_LOBBY_SUCCESS', payload: { room: data.room } })
        dispatch({ type: 'SET_LOADING', payload: false })
      },

      'lobby-update': (data: { players: any[] }) => {
        console.log('Lobby update:', data)
        dispatch({ type: 'LOBBY_UPDATE', payload: { players: data.players } })
      },

      'game-started': (data: any) => {
        console.log('Game started:', data)
        dispatch({ 
          type: 'GAME_STARTED', 
          payload: { 
            gameId: data.gameId, 
            players: data.players,
            totalQuestions: data.totalQuestions
          } 
        })
        dispatch({ type: 'SET_LOADING', payload: false })
      },

      'new-question': (data: any) => {
        console.log('New question:', data)
        dispatch({ 
          type: 'NEW_QUESTION', 
          payload: {
            question: data.question,
            questionNumber: data.questionNumber,
            totalQuestions: data.totalQuestions,
            timeLimit: data.timeLimit
          }
        })
      },

      'timer-update': (data: { timeLeft: number }) => {
        dispatch({ type: 'TIMER_UPDATE', payload: { timeLeft: data.timeLeft } })
      },

      'answer-submitted': (data: any) => {
        if (data.playerId === socket.id) {
          dispatch({ type: 'ANSWER_SUBMITTED' })
        }
      },

      'question-ended': (data: any) => {
        console.log('Question ended:', data)
        dispatch({ 
          type: 'QUESTION_ENDED', 
          payload: { 
            correctAnswer: data.correctAnswer, 
            scores: data.scores 
          } 
        })
      },

      'game-ended': (data: any) => {
        console.log('Game ended:', data)
        dispatch({ 
          type: 'GAME_ENDED', 
          payload: { 
            finalScores: data.finalScores, 
            winner: data.winner 
          } 
        })
      },

      'game-error': (data: { message: string }) => {
        dispatch({ type: 'SET_ERROR', payload: data.message })
      },

      'answer-error': (data: { message: string }) => {
        dispatch({ type: 'SET_ERROR', payload: data.message })
      }
    }

    // Attach all handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler)
    })

    // Cleanup
    return () => {
      Object.keys(handlers).forEach(event => {
        socket.off(event)
      })
    }
  }, [socket])

  // Actions
  const actions = {
    joinLobby: (gameType: string, username: string) => {
      if (!socket) return
      dispatch({ type: 'SET_LOADING', payload: true })
      socket.emit('join-lobby', { gameType, username })
    },

    leaveLobby: (gameType: string) => {
      if (!socket) return
      socket.emit('leave-lobby', { gameType })
      dispatch({ type: 'LEAVE_LOBBY' })
      dispatch({ type: 'SET_LOADING', payload: false })
    },

    startGame: (gameType: string, players: any[]) => {
      if (!socket) return
      dispatch({ type: 'SET_LOADING', payload: true })
      socket.emit('start-game', { gameType, players })
    },

    submitAnswer: (answer: string) => {
      if (!socket || !state.currentQuestion || !state.gameId) return
      
      socket.emit('submit-answer', {
        gameId: state.gameId,
        answer: answer.trim(),
        questionId: state.currentQuestion.id
      })
    },

    setAnswer: (answer: string) => {
      dispatch({ type: 'SET_ANSWER', payload: answer })
    },

    resetGame: () => {
      dispatch({ type: 'RESET_GAME' })
    }
  }

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  )
}

// Hook
export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}