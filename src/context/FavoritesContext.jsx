import { subscribeCatalog } from '../services/mockStore.js'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAuth } from './useAuth'
import {
  addFavorite,
  clearFavorites,
  getFavoritesByUser,
  removeFavorite,
} from '../services/favoriteService'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const userId = isAuthenticated ? user?.id : null

  const [favorites, setFavorites] = useState([])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [busyProductIds, setBusyProductIds] = useState([])

  const refreshFavorites = useCallback(async (signal) => {
    if (!userId) {
      setFavorites([])
      setStatus('success')
      setError('')
      return []
    }

    setStatus('loading')
    setError('')

    try {
      const data = await getFavoritesByUser(userId, { signal })
      signal?.throwIfAborted()
      setFavorites(data)
      setStatus('success')
      return data
    } catch (requestError) {
      if (requestError.name === 'AbortError') return []

      setError(requestError.message || 'No se pudieron cargar los favoritos')
      setStatus('error')
      return []
    }
  }, [userId])

  useEffect(() => {
    const controller = new AbortController()
    refreshFavorites(controller.signal)

    return () => controller.abort()
  }, [refreshFavorites])

  useEffect(() => subscribeCatalog(() => { refreshFavorites() }), [refreshFavorites])

  const emptyFavorites = useCallback(async () => {
    if (!userId) return
    await clearFavorites(userId)
    await refreshFavorites()
  }, [userId, refreshFavorites])

  const toggleFavorite = useCallback(async (productoId) => {
    if (!userId) {
      throw new Error('Iniciá sesión para guardar favoritos')
    }

    const numericProductId = Number(productoId)
    const isAlreadyFavorite = favorites.some(
      (favorite) => favorite.productoId === numericProductId,
    )

    setBusyProductIds((current) =>
      current.includes(numericProductId)
        ? current
        : [...current, numericProductId],
    )

    try {
      if (isAlreadyFavorite) {
        await removeFavorite(userId, numericProductId)
        setFavorites((current) =>
          current.filter(
            (favorite) => favorite.productoId !== numericProductId,
          ),
        )
      } else {
        const created = await addFavorite(userId, numericProductId)
        setFavorites((current) => [...current, created])
      }
    } finally {
      setBusyProductIds((current) =>
        current.filter((id) => id !== numericProductId),
      )
    }
  }, [favorites, userId])

  const value = useMemo(() => ({
    favorites,
    status,
    error,
    busyProductIds,
    isFavorite: (productoId) =>
      favorites.some(
        (favorite) => favorite.productoId === Number(productoId),
      ),
    toggleFavorite,
    refreshFavorites,
    emptyFavorites,
  }), [
    favorites,
    status,
    error,
    busyProductIds,
    toggleFavorite,
    refreshFavorites,
    emptyFavorites,
  ])

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)

  if (!context) {
    throw new Error('useFavorites debe utilizarse dentro de FavoritesProvider')
  }

  return context
}
