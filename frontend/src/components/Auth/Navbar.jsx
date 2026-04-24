import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const active = path => pathname === path ? 'nav-link active' : 'nav-link'

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">⬡ Eventlink</Link>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/events"  className={active('/events')}>Events</Link>
              <Link to="/booked"  className={active('/booked')}>Bookings</Link>
              <Link to="/qrcodes" className={active('/qrcodes')}>QR Codes</Link>
              {user.role === 'admin'     && <Link to="/admin"    className={active('/admin')}>Admin</Link>}
              {user.role === 'validator' && <Link to="/validate" className={active('/validate')}>Validate</Link>}
              <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"  className="btn btn-outline btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
