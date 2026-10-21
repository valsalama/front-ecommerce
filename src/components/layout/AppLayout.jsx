import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import ScrollManager from './ScrollManager'

function AppLayout() {
  return (
    <div className="app">
      <ScrollManager />
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default AppLayout
