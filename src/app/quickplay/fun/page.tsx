'use client'

import { useState, useEffect } from 'react'
import { useSocket } from '@/hooks/useSocket'
import Link from 'next/link'
import GameView from '@/components/GameView'

interface Player {
  id: string
  username: string
  timestamp: Date
}

export default function QuickplayFunPage() {
  const { socket, isConnected } = useSocket()
  const [username, setUsername] = useState('')
  const [isInLobby, setIsInLobby] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    if (!socket) return

    socket.on('joined-lobby', (data) => {
      console.log('Joined lobby:', data)
      setIsInLobby(true)
    })

    socket.on('player-joined', (player: Player) => {
      setPlayers(prev => [...prev.filter(p => p.id !== player.id), player])
    })

    socket.on('player-left', (data: { playerId: string }) => {
      setPlayers(prev => prev.filter(p => p.id !== data.playerId))
    })

    socket.on('game-started', (data) => {
      console.log('Game started:', data)
      setGameStarted(true)
    })

    return () => {
      socket.off('joined-lobby')
      socket.off('player-joined')
      socket.off('player-left')
      socket.off('game-started')
    }
  }, [socket])

  const joinLobby = () => {
    if (!username.trim()) {
      alert('Veuillez entrer un nom d\'utilisateur')
      return
    }

    socket?.emit('join-lobby', {
      gameType: 'fun',
      username: username.trim()
    })
  }

  const leaveLobby = () => {
    socket?.emit('leave-lobby', { gameType: 'fun' })
    setIsInLobby(false)
    setPlayers([])
  }

  const startGame = () => {
    if (players.length < 2) {
      alert('Il faut au moins 2 joueurs pour commencer')
      return
    }

    socket?.emit('start-game', {
      gameType: 'fun',
      players: players
    })
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Connexion au serveur...</p>
          </div>
        </div>
      </div>
    )
  }

  if (gameStarted) {
    return <GameView socket={socket} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Quickplay Fun</h1>
          <p className="text-gray-300">Lobby de jeu décontracté - Aucune inscription requise</p>
        </div>

        {!isInLobby ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Rejoindre le lobby</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre pseudo"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  onKeyPress={(e) => e.key === 'Enter' && joinLobby()}
                />
              </div>

              <button
                onClick={joinLobby}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Rejoindre le lobby
              </button>
            </div>

            <div className="text-center mt-6">
              <Link href="/" className="text-gray-400 hover:text-gray-300 text-sm">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Joueurs connectés ({players.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {players.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">En attente de joueurs...</p>
                ) : (
                  players.map((player) => (
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

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Actions</h3>
              <div className="space-y-4">
                <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
                  <p className="text-blue-200 text-sm mb-2">
                    ✅ Connecté en tant que <strong>{username}</strong>
                  </p>
                  <p className="text-blue-200 text-sm">
                    En attente d'autres joueurs...
                  </p>
                </div>

                <button
                  onClick={startGame}
                  disabled={players.length < 2}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
                >
                  {players.length < 2 
                    ? `En attente de joueurs (${players.length}/2 min)`
                    : `Commencer la partie (${players.length} joueurs)`
                  }
                </button>

                <button
                  onClick={leaveLobby}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors"
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