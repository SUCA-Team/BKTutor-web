import './App.css'
import { NavLink, Routes, Route } from 'react-router-dom'
import ROUTES from './pages/routes'
import Login from './components/Login'
import Logo from './assets/Logo.png'
import BG from './assets/Background-pattern.png'
import { useEffect, useState } from 'react'
import { useAuth } from './contexts/AuthContext'

function App() {
  const [now, setNow] = useState(() => new Date())
  const { isAuthenticated, user, logout, isLoading } = useAuth()

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div>Đang tải...</div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />
  }

  const pad2 = (n: number) => String(n).padStart(2, '0')

  const day = now.getDate()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const hours = pad2(now.getHours())
  const minutes = pad2(now.getMinutes())

  // Vietnamese weekday, capitalize first letter
  const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(now)
  const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1)

  // day of year
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = Number(now) - Number(start) + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  const weekNumber = Math.ceil(dayOfYear / 7)

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="sidebar-header" style={{ backgroundImage: `url(${BG})` }}>
          <img src={Logo} alt="Logo" className="sidebar-logo" />
          <h2 className="app-title">BK Tutor</h2>
          <div className="avatar">Avatar</div>
          <div className="user-name">{user?.full_name || user?.username}</div>
          <div className="user-id">{user?.email}</div>
          <button className="logout-button" onClick={logout}>
            Đăng xuất
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {ROUTES.map((r) => (
              <li key={r.path}>
                <NavLink to={r.path} className={({ isActive }) => (isActive ? 'active' : '')}>
                  {r.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="week-pill">Tuần {weekNumber}</div>
          <div className="date-line">{weekdayCap}, Ngày {day}/{month}/{year}</div>
          <div className="time-line">{hours}:{minutes}</div>
        </div>
      </aside>

      <main className="content-container">
        <Routes>
          {ROUTES.map((r) => {
            const Component = r.component as React.ComponentType
            return <Route key={r.path} path={r.path} element={<Component />} />
          })}
        </Routes>
      </main>
    </div>
  )
}

export default App
