// src/app/admin/broncos-games/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { BroncosGame, mainDishOptions } from '../../../lib/broncos-events'

export default function BroncosGamesAdmin() {
  const [games, setGames] = useState<BroncosGame[]>([])
  const [mainDishOptions, setMainDishOptions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingGame, setEditingGame] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ mainDish: string; description: string; whatWeProvide: string }>({
    mainDish: '',
    description: '',
    whatWeProvide: ''
  })

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/broncos-games')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setGames(data.games)
      setMainDishOptions(data.mainDishOptions)
    } catch (error) {
      console.error('Failed to fetch Broncos games:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch Broncos games')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (game: BroncosGame) => {
    setEditingGame(game.id)
    setEditForm({
      mainDish: game.mainDish,
      description: game.description,
      whatWeProvide: game.whatWeProvide || ''
    })
  }

  const handleSave = async (gameId: string) => {
    try {
      const response = await fetch('/api/admin/broncos-games', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          updates: editForm
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        // Update the local state
        setGames(games.map(game => 
          game.id === gameId 
            ? { ...game, ...editForm }
            : game
        ))
        setEditingGame(null)
      } else {
        setError(data.error || 'Failed to update game')
      }
    } catch (error) {
      console.error('Failed to update game:', error)
      setError(error instanceof Error ? error.message : 'Failed to update game')
    }
  }

  const handleCancel = () => {
    setEditingGame(null)
    setEditForm({ mainDish: '', description: '' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Broncos games...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchGames}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Broncos Games Management</h1>
          <p className="mt-2 text-gray-600">
            Manage potluck details for Broncos games. Update main dishes and descriptions for each game.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6">
              {games.map((game) => (
                <div key={game.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Broncos vs {game.opponent}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(game.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })} at {new Date(`2000-01-01T${game.time}`).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {game.homeAway === 'home' ? '🏠 Home Game' : game.homeAway === 'away' ? '✈️ Away Game' : '🏆 Neutral Site'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit(game)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Edit
                    </button>
                  </div>

                  {editingGame === game.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Main Dish
                        </label>
                        <select
                          value={editForm.mainDish}
                          onChange={(e) => setEditForm({ ...editForm, mainDish: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          {mainDishOptions.map((dish) => (
                            <option key={dish} value={dish}>{dish}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          What We Provide (Display Text)
                        </label>
                        <input
                          type="text"
                          value={editForm.whatWeProvide || ''}
                          onChange={(e) => setEditForm({ ...editForm, whatWeProvide: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., Taco Bar with all the fixings"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Describe the potluck event..."
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleSave(game.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-green-50 p-3 rounded-lg mb-3">
                        <p className="text-sm font-medium text-green-800 mb-1">Main Dish:</p>
                        <p className="text-lg font-semibold text-green-700">{game.mainDish}</p>
                      </div>
                      <p className="text-sm text-gray-600">{game.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Available Main Dish Options</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p className="mb-2">You can choose from these main dish options:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {mainDishOptions.map((dish) => (
                    <span key={dish} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {dish}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
