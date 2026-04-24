import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Auth/Navbar'

const CATS = ['All', 'Technical', 'Non-Technical', 'Workshop']

export default function Events() {
  const [events, setEvents] = useState([])
  const [cat, setCat]       = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/events').then(r => { setEvents(r.data); setLoading(false) })
  }, [])

  const filtered = events.filter(e =>
    (cat === 'All' || e.category === cat) &&
    e.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Navbar />
      <div className="container page">
        <h2 style={{ marginBottom: 24 }}>Browse Events</h2>

        <div className="flex gap-16" style={{ marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <input placeholder="Search events…" value={search}
            onChange={e => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
          <div className="flex gap-8">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-outline'}`}>{c}</button>
            ))}
          </div>
        </div>

        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : filtered.length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>No events found.</p>
            : <div className="grid-3">
                {filtered.map(ev => (
                  <div className="card card-hover event-card" key={ev._id}>
                    <div className="event-card-top">{ev.emoji || '🎪'}</div>
                    <div className="event-title">{ev.name}</div>
                    <div className="event-meta">
                      <span>📍 {ev.location}</span>
                      <span>📅 {new Date(ev.date).toLocaleDateString()}</span>
                      <span>🕐 {ev.time}</span>
                    </div>
                    <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-primary">{ev.category}</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>₹{ev.fee}</span>
                    </div>
                    <Link to={`/payment/${ev._id}`} className="btn btn-primary btn-full mt-16">
                      Register & Pay
                    </Link>
                  </div>
                ))}
              </div>
        }
      </div>
    </>
  )
}
