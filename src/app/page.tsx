'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface User {
  type: 'guest' | 'user'
  username: string
  id: string
  email?: string
  elo?: number
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Vérifier s'il y a un utilisateur connecté
    const savedUser = localStorage.getItem('nexter-user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    } else {
      // Rediriger vers la page de bienvenue si pas connecté
      router.push('/welcome')
    }
    setLoading(false)
  }, [router])

  const logout = () => {
    localStorage.removeItem('nexter-user')
    localStorage.removeItem('nexter-username') // Nettoyer aussi l'ancien système
    router.push('/welcome')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) {
    return null // Redirection en cours
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec info utilisateur */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-white">
            <h2 className="text-2xl font-bold">Nexter</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white">
              <span className="text-gray-300">Connecté en tant que:</span>
              <div className="font-bold">
                {user.type === 'guest' ? '👤' : '🔐'} {user.username}
                {user.type === 'user' && user.elo && (
                  <span className="text-yellow-400 ml-2">ELO: {user.elo}</span>
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Bienvenue {user.username} !
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Testez vos connaissances en culture générale
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">Quickplay Fun</h2>
            <p className="text-gray-300 mb-6">
              Jouez instantanément sans inscription. Amusez-vous avec des questions de culture générale !
            </p>
            <Link 
              href="/quickplay/fun"
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Jouer maintenant
            </Link>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">Quickplay Compétitif</h2>
            <p className="text-gray-300 mb-6">
              Affrontez d'autres joueurs, gagnez des points ELO et grimpez dans le classement !
            </p>
            {user.type === 'guest' ? (
              <div>
                <p className="text-yellow-200 text-sm mb-4">
                  ⚠️ Compte utilisateur requis pour le mode compétitif
                </p>
                <Link 
                  href="/auth/login"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            ) : (
              <Link 
                href="/quickplay/competitive"
                className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Jouer en compétitif
              </Link>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">Compétitions</h2>
            <p className="text-gray-300 mb-6">
              Participez à des tournois ou créez le vôtre. Défis organisés et récompenses !
            </p>
            <Link 
              href="/competitions"
              className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Voir les compétitions
            </Link>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">Créer un Quiz</h2>
            <p className="text-gray-300 mb-6">
              Contribuez à la communauté en créant vos propres questions de culture générale !
            </p>
            <Link 
              href="/quiz/create"
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Créer des questions
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
