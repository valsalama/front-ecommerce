import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import ScrollManager from './ScrollManager'
import ThemeToggle from '../ThemeToggle'

function AppLayout() {
  return (
    <div className="app">
      <ScrollManager />
      <Header />

      <div className="theme-toolbar">
        <ThemeToggle />
      </div>

      <main className="app-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default AppLayout