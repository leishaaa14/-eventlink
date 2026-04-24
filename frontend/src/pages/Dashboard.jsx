// Dashboard.jsx
import { useState, useEffect } from 'react'
import api from '../utils/api'
import Navbar from '../components/Auth/Navbar'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => { api.get('/users/stats').then(r => setStats(r.data)).catch(() => {}) }, [])

  return (
    <>
      <Navbar />
      <div className="container page">
        <h2 style={{ marginBottom: 24 }}>Welcome, {user?.name} 👋</h2>
        {stats && (
          <div className="grid-3" style={{ marginBottom: 32 }}>
            {[
              { label: 'Registered Events', value: stats.total,  color: 'var(--primary-light)' },
              { label: 'Paid',              value: stats.paid,   color: 'var(--success)' },
              { label: 'Unpaid',            value: stats.unpaid, color: 'var(--warning)' },
            ].map(s => (
              <div className="card" key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
        <p style={{ color: 'var(--text-muted)' }}>
          Use the nav above to browse events, view your bookings, or download QR codes.
        </p>
      </div>
    </>
  )
}
