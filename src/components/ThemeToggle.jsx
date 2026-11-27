import { useEffect, useState } from 'react'

const STORAGE_KEY = 'trama-theme'

function readTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark'
      ? 'dark'
      : 'light'
  } catch {
    return 'light'
  }
}

function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme

    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // El selector sigue funcionando si el almacenamiento está bloqueado.
    }
  }, [theme])

  return (
    <button
      className="session-button"
      type="button"
      aria-pressed={theme === 'dark'}
      onClick={() => {
        setTheme((current) => current === 'dark' ? 'light' : 'dark')
      }}
    >
      {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
    </button>
  )
}

export default ThemeToggle