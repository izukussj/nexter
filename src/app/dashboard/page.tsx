'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  username: string
  elo: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push('/auth/login')
    }
    setLoading(false)
  }, [router])

  const logout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-300">Bienvenue, {user.username} !</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Déconnexion
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-2">ELO Rating</h3>
            <p className="text-3xl font-bold text-yellow-400">{user.elo}</p>
            <p className="text-gray-300 text-sm mt-2">Points de classement</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-2">Parties jouées</h3>
            <p className="text-3xl font-bold text-green-400">0</p>
            <p className="text-gray-300 text-sm mt-2">Total des parties</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-2">Rang</h3>
            <p className="text-2xl font-bold text-purple-400">Débutant</p>
            <p className="text-gray-300 text-sm mt-2">Votre niveau actuel</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">Modes de jeu</h3>
            <div className="space-y-4">
              <Link 
                href="/quickplay/competitive"
                className="block bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg p-4 transition-colors"
              >
                <h4 className="text-lg font-bold text-white mb-2">Quickplay Compétitif</h4>
                <p className="text-gray-300 text-sm">Affrontez d'autres joueurs et gagnez des points ELO</p>
              </Link>

              <Link 
                href="/quickplay/fun"
                className="block bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded-lg p-4 transition-colors"
              >
                <h4 className="text-lg font-bold text-white mb-2">Quickplay Fun</h4>
                <p className="text-gray-300 text-sm">Jouez sans pression, juste pour le plaisir</p>
              </Link>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">Actions</h3>
            <div className="space-y-4">
              <Link 
                href="/competitions"
                className="block bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 rounded-lg p-4 transition-colors"
              >
                <h4 className="text-lg font-bold text-white mb-2">Compétitions</h4>
                <p className="text-gray-300 text-sm">Participez ou créez des tournois</p>
              </Link>

              <Link 
                href="/quiz/create"
                className="block bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 rounded-lg p-4 transition-colors"
              >
                <h4 className="text-lg font-bold text-white mb-2">Créer des questions</h4>
                <p className="text-gray-300 text-sm">Contribuez à la base de questions</p>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">Historique récent</h3>
            <div className="text-center py-8">
              <p className="text-gray-400">Aucune partie jouée récemment</p>
              <p className="text-gray-500 text-sm mt-2">Vos dernières parties apparaîtront ici</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}