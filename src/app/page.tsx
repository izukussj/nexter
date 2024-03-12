'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            Nexter
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
            <Link 
              href="/auth/login"
              className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Se connecter pour jouer
            </Link>
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

        <div className="text-center mt-16">
          <div className="flex justify-center space-x-8">
            <Link href="/auth/login" className="text-gray-300 hover:text-white transition-colors">
              Se connecter
            </Link>
            <Link href="/auth/register" className="text-gray-300 hover:text-white transition-colors">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
