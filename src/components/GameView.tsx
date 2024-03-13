'use client'

import { useState, useEffect } from 'react'
import { Socket } from 'socket.io-client'

interface Question {
  id: string
  text: string
  category: string
  imageUrl?: string
  videoUrl?: string
}

interface Player {
  id: string
  username: string
  score: number
}

interface GameViewProps {
  socket: Socket
}

export default function GameView({ socket }: GameViewProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [answer, setAnswer] = useState('')
  const [hasAnswered, setHasAnswered] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [gameEnded, setGameEnded] = useState(false)
  const [winner, setWinner] = useState<Player | null>(null)
  const [gameId, setGameId] = useState('')

  useEffect(() => {
    if (!socket) return

    socket.on('game-started', (data) => {
      setGameId(data.gameId)
      setPlayers(data.players)
    })

    socket.on('new-question', (data) => {
      setCurrentQuestion(data.question)
      setQuestionNumber(data.questionNumber)
      setTotalQuestions(data.totalQuestions)
      setTimeLeft(data.timeLimit)
      setAnswer('')
      setHasAnswered(false)
      setShowResults(false)
    })

    socket.on('question-ended', (data) => {
      setCorrectAnswer(data.correctAnswer)
      setPlayers(data.scores)
      setShowResults(true)
    })

    socket.on('game-ended', (data) => {
      setPlayers(data.finalScores)
      setWinner(data.winner)
      setGameEnded(true)
    })

    socket.on('answer-submitted', (data) => {
      if (data.playerId === socket.id) {
        setHasAnswered(true)
      }
    })

    return () => {
      socket.off('game-started')
      socket.off('new-question')
      socket.off('question-ended')
      socket.off('game-ended')
      socket.off('answer-submitted')
    }
  }, [socket])

  useEffect(() => {
    if (currentQuestion && !showResults && !hasAnswered) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [currentQuestion, showResults, hasAnswered])

  const submitAnswer = () => {
    if (!answer.trim() || hasAnswered || !currentQuestion) return

    socket.emit('submit-answer', {
      gameId,
      answer: answer.trim(),
      questionId: currentQuestion.id
    })
  }

  if (gameEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
            <h1 className="text-4xl font-bold text-white mb-6">🎉 Partie terminée !</h1>
            
            {winner && (
              <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-yellow-300 mb-2">🏆 Gagnant</h2>
                <p className="text-3xl font-bold text-white">{winner.username}</p>
                <p className="text-yellow-200">Score final : {winner.score} points</p>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Classement final</h3>
              <div className="space-y-2">
                {players.map((player, index) => (
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
              onClick={() => window.location.reload()}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Rejouer
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Réponse</h2>
              <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-6">
                <p className="text-green-200 mb-2">La bonne réponse était :</p>
                <p className="text-3xl font-bold text-white">{correctAnswer}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Scores actuels</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {players.map((player, index) => (
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

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">En attente de la première question...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <div className="text-white">
              <span className="text-lg">Question {questionNumber}/{totalQuestions}</span>
            </div>
            <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
              ⏱️ {timeLeft}s
            </div>
          </div>

          <div className="mb-8">
            <div className="bg-purple-500/20 border border-purple-500/40 rounded-lg p-2 mb-4 inline-block">
              <span className="text-purple-200 text-sm font-medium">{currentQuestion.category}</span>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-6">{currentQuestion.text}</h2>
            
            {currentQuestion.imageUrl && (
              <img 
                src={currentQuestion.imageUrl} 
                alt="Question context" 
                className="max-w-full h-auto rounded-lg mb-6"
              />
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="answer" className="block text-lg font-medium text-white mb-2">
                Votre réponse :
              </label>
              <div className="flex space-x-4">
                <input
                  type="text"
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={hasAnswered || timeLeft === 0}
                  placeholder="Tapez votre réponse ici..."
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 disabled:opacity-50"
                  onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                />
                <button
                  onClick={submitAnswer}
                  disabled={!answer.trim() || hasAnswered || timeLeft === 0}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {hasAnswered ? '✓ Envoyé' : 'Envoyer'}
                </button>
              </div>
            </div>

            {hasAnswered && (
              <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4">
                <p className="text-blue-200">
                  ✅ Réponse envoyée ! En attente des autres joueurs...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}