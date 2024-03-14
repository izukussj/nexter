'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GameProvider, useGame } from '@/ui/contexts/GameContext'
import Lobby from '@/ui/components/Lobby'
import GameBoard from '@/ui/components/GameBoard'

function QuickplayFunContent() {
  const { state } = useGame()
  const router = useRouter()

  // Check if user exists
  useEffect(() => {
    const savedUser = localStorage.getItem('nexter-user')
    if (!savedUser) {
      router.push('/welcome')
    }
  }, [router])

  // Render based on game phase
  switch (state.gamePhase) {
    case 'lobby':
      return <Lobby gameType="fun" />
    
    case 'waiting':
    case 'playing':
    case 'question_ended':
    case 'game_ended':
      return <GameBoard />
    
    default:
      return <Lobby gameType="fun" />
  }
}

export default function QuickplayFunPage() {
  return (
    <GameProvider>
      <QuickplayFunContent />
    </GameProvider>
  )
}