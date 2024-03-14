'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useGame } from '../contexts/GameContext'

interface User {
  type: 'guest' | 'user'
  username: string
  id: string
  email?: string
  elo?: number
}

interface LobbyProps {
  gameType: 'fun' | 'competitive'
}

export default function Lobby({ gameType }: LobbyProps) {
  const { state, actions } = useGame()
  const [user, setUser] = useState<User | null>(null)

  // Get user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('nexter-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // Join lobby when user is loaded
  useEffect(() => {
    if (user && !state.isInLobby && !state.loading) {
      actions.joinLobby(gameType, user.username)
    }
  }, [user, gameType]) // Removed state.isInLobby and actions from dependencies

  const handleStartGame = () => {
    if (state.lobbyPlayers.length < 2) {
      alert('Il faut au moins 2 joueurs pour commencer')
      return
    }

    actions.startGame(gameType, state.lobbyPlayers)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Quickplay {gameType === 'fun' ? 'Fun' : 'Compétitif'}
          </h1>
          <p className="text-gray-300">
            {gameType === 'fun' 
              ? 'Lobby de jeu décontracté - Aucune inscription requise'
              : 'Mode compétitif avec système ELO'
            }
          </p>
        </div>

        {!state.isInLobby ? (
          /* Joining lobby */
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Connexion au lobby</h2>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-white mb-2">Connecté en tant que :</p>
                <p className="text-2xl font-bold text-blue-400">
                  {user.type === 'guest' ? '👤' : '🔐'} {user.username}
                </p>
                {user.type === 'user' && user.elo && (
                  <p className="text-yellow-400 mt-2">ELO: {user.elo}</p>
                )}
              </div>

              {state.loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-white">Connexion en cours...</p>
                </div>
              )}

              {state.error && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3">
                  <p className="text-red-200 text-sm">{state.error}</p>
                </div>
              )}
            </div>

            <div className="text-center mt-6">
              <Link href="/" className="text-gray-400 hover:text-gray-300 text-sm">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        ) : (
          /* In lobby */
          <div className="grid md:grid-cols-2 gap-8">
            {/* Players list */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">
                Joueurs connectés ({state.lobbyPlayers.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {state.lobbyPlayers.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">En attente de joueurs...</p>
                ) : (
                  state.lobbyPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="bg-white/5 rounded-lg p-3 flex justify-between items-center"
                    >
                      <span className="text-white font-medium">{player.username}</span>
                      <span className="text-green-400 text-sm">🟢 En ligne</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Actions</h3>
              <div className="space-y-4">
                {/* Status */}
                <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
                  <p className="text-blue-200 text-sm mb-2">
                    ✅ Connecté en tant que <strong>{user.type === 'guest' ? '👤' : '🔐'} {user.username}</strong>
                  </p>
                  <p className="text-blue-200 text-sm">
                    En attente d'autres joueurs...
                  </p>
                </div>

                {/* Loading indicator */}
                {state.loading && (
                  <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
                      <p className="text-yellow-200 text-sm">Démarrage de la partie...</p>
                    </div>
                  </div>
                )}

                {/* Error */}
                {state.error && (
                  <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4">
                    <p className="text-red-200 text-sm">❌ {state.error}</p>
                  </div>
                )}

                {/* Start game button */}
                <button
                  onClick={handleStartGame}
                  disabled={state.lobbyPlayers.length < 2 || state.loading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
                >
                  {state.lobbyPlayers.length < 2 
                    ? `En attente de joueurs (${state.lobbyPlayers.length}/2 min)`
                    : state.loading
                    ? 'Démarrage...'
                    : `Commencer la partie (${state.lobbyPlayers.length} joueurs)`
                  }
                </button>

                {/* Leave lobby button */}
                <button
                  onClick={() => actions.leaveLobby(gameType)}
                  disabled={state.loading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Quitter le lobby
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}