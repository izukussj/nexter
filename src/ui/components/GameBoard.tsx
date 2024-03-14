'use client'

import { useGame } from '../contexts/GameContext'

export default function GameBoard() {
  const { state, actions } = useGame()

  // Game ended view
  if (state.gamePhase === 'game_ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
            <h1 className="text-4xl font-bold text-white mb-6">🎉 Partie terminée !</h1>
            
            {state.winner && (
              <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-yellow-300 mb-2">🏆 Gagnant</h2>
                <p className="text-3xl font-bold text-white">{state.winner.username}</p>
                <p className="text-yellow-200">Score final : {state.winner.score} points</p>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Classement final</h3>
              <div className="space-y-2">
                {state.finalScores.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex justify-between items-center p-4 rounded-lg ${
                      index === 0 ? 'bg-yellow-500/20 border border-yellow-500/40' :
                      index === 1 ? 'bg-gray-500/20 border border-gray-500/40' :
                      index === 2 ? 'bg-orange-500/20 border border-orange-500/40' :
                      'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="text-white font-medium">{player.username}</span>
                    </div>
                    <span className="text-xl font-bold text-white">{player.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => actions.resetGame()}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Nouvelle partie
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Question results view
  if (state.gamePhase === 'question_ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Réponse</h2>
              <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-6">
                <p className="text-green-200 mb-2">La bonne réponse était :</p>
                <p className="text-3xl font-bold text-white">{state.correctAnswer}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Scores actuels</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {state.players.map((player) => (
                  <div
                    key={player.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-center"
                  >
                    <span className="text-white font-medium">{player.username}</span>
                    <span className="text-xl font-bold text-yellow-400">{player.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-300">Question suivante dans quelques secondes...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Waiting for question
  if (state.gamePhase === 'waiting' || !state.currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">
              {state.gamePhase === 'waiting' ? 'La partie commence...' : 'En attente de la première question...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Playing - main game view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-white">
              <span className="text-lg">Question {state.questionNumber}/{state.totalQuestions}</span>
            </div>
            <div className={`text-2xl font-bold ${state.timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
              ⏱️ {state.timeLeft}s
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="bg-purple-500/20 border border-purple-500/40 rounded-lg p-2 mb-4 inline-block">
              <span className="text-purple-200 text-sm font-medium">{state.currentQuestion.category}</span>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-6">{state.currentQuestion.text}</h2>
            
            {state.currentQuestion.imageUrl && (
              <img 
                src={state.currentQuestion.imageUrl} 
                alt="Question context" 
                className="max-w-full h-auto rounded-lg mb-6"
              />
            )}
          </div>

          {/* Answer Input */}
          <div className="space-y-4">
            <div>
              <label htmlFor="answer" className="block text-lg font-medium text-white mb-2">
                Votre réponse :
              </label>
              <div className="flex space-x-4">
                <input
                  type="text"
                  id="answer"
                  value={state.answer}
                  onChange={(e) => actions.setAnswer(e.target.value)}
                  disabled={state.hasAnswered || state.timeLeft === 0}
                  placeholder="Tapez votre réponse ici..."
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 disabled:opacity-50"
                  onKeyPress={(e) => e.key === 'Enter' && !state.hasAnswered && state.answer.trim() && actions.submitAnswer(state.answer)}
                />
                <button
                  onClick={() => actions.submitAnswer(state.answer)}
                  disabled={!state.answer.trim() || state.hasAnswered || state.timeLeft === 0}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {state.hasAnswered ? '✓ Envoyé' : 'Envoyer'}
                </button>
              </div>
            </div>

            {/* Answer confirmation */}
            {state.hasAnswered && (
              <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
                <p className="text-blue-200">
                  ✅ Réponse envoyée ! En attente des autres joueurs...
                </p>
              </div>
            )}

            {/* Error display */}
            {state.error && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4">
                <p className="text-red-200">❌ {state.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}