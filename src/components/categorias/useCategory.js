import { useEffect, useState } from 'react'
import { getCategoryById } from '../../services/categoryService'

export default function useCategory(id) {
  const [result, setResult] = useState({ status: 'loading', category: null, error: '' })
  useEffect(() => {
    const controller = new AbortController()
    getCategoryById(id, { signal: controller.signal })
      .then((category) => {
        if (!controller.signal.aborted) setResult({ id, status: 'success', category, error: '' })
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResult({ id, status: 'error', category: null, error: error.message })
      })
    return () => controller.abort()
  }, [id])
  return result.id === id ? result : { status: 'loading', category: null, error: '' }
}
