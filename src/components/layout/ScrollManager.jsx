import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollManager() {
  const { hash, pathname } = useLocation()

  useEffect(() => {
    if (hash) {
      window.requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
      })
      return
    }

    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [hash, pathname])

  return null
}

export default ScrollManager
