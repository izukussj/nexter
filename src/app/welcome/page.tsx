'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const [guestUsername, setGuestUsername] = useState('')
  const [showGuestForm, setShowGuestForm] = useState(false)
  const router = useRouter()

  const connectAsGuest = () => {
    if (!guestUsername.trim()) {
      alert('Veuillez entrer un nom d\'utilisateur')
      return
    }

    localStorage.setItem('nexter-user', JSON.stringify({
      type: 'guest',
      username: guestUsername.trim(),
      id: `guest-${Date.now()}`
    }))

    router.push('/')
  }

  const connectWithAccount = () => {
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Bienvenue sur Nexter
          </h1>
          <p className="text-gray-300">
            Choisissez votre mode de connexion
          </p>
        </div>

        {!showGuestForm ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowGuestForm(true)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>👤</span>
              <span>Continuer en tant qu'invité</span>
            </button>

            <div className="text-center text-gray-400 py-2">
              ou
            </div>

            <button
              onClick={connectWithAccount}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔐</span>
              <span>Se connecter avec un compte</span>
            </button>

            <Link 
              href="/auth/register"
              className="block text-center text-blue-400 hover:text-blue-300 text-sm mt-4"
            >
              Pas encore de compte ? S'inscrire
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Connexion Invité</h2>
              <p className="text-gray-300 text-sm mb-4 text-center">
                Choisissez un nom d'utilisateur pour jouer
              </p>
            </div>

            <div>
              <label htmlFor="guestUsername" className="block text-sm font-medium text-gray-300 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="guestUsername"
                value={guestUsername}
                onChange={(e) => setGuestUsername(e.target.value)}
                placeholder="Votre pseudo"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                onKeyPress={(e) => e.key === 'Enter' && connectAsGuest()}
                autoFocus
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={connectAsGuest}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Commencer à jouer
              </button>

              <button
                onClick={() => setShowGuestForm(false)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-lg transition-colors"
              >
                Retour
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}