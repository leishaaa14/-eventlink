import { useState, useEffect } from 'react'
import api from '../utils/api'
import Navbar from '../components/Auth/Navbar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const INIT = { name: '', category: 'Technical', department: 'CSE', location: '', date: '', time: '10:00 AM', fee: 0, teamSize: 1, emoji: '🎪', description: '' }

export default function AdminDashboard() {
  const [stats,  setStats]   = useState(null)
  const [events, setEvents]  = useState([])
  const [form,   setForm]    = useState(INIT)
  const [msg,    setMsg]     = useState({ text: '', type: '' })
  const [tab,    setTab]     = useState('events') // 'events' | 'add' | 'users'
  const [users,  setUsers]   = useState([])

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data))
    api.get('/events').then(r => setEvents(r.data))
  }, [])

  const loadUsers = () => {
    if (users.length) return
    api.get('/admin/users').then(r => setUsers(r.data))
  }

  const addEvent = async e => {
    e.preventDefault()
    try {
      const { data } = await api.post('/admin/events', form)
      setEvents([data, ...events])
      setMsg({ text: 'Event added successfully!', type: 'success' })
      setForm(INIT)
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to add event', type: 'error' })
    }
  }

  const deleteEvent = async id => {
    if (!confirm('Delete this event?')) return
    await api.delete(`/admin/events/${id}`)
    setEvents(events.filter(e => e._id !== id))
  }

  return (
    <>
      <Navbar />
      <div className="container page">
        <h2 style={{ marginBottom: 24 }}>Admin Dashboard</h2>

        {/* Stat cards */}
        {stats && (
          <div className="grid-3" style={{ marginBottom: 32 }}>
            {[
              { label: 'Total Users',    value: stats.users,    color: 'var(--primary-light)' },
              { label: 'Total Bookings', value: stats.bookings, color: 'var(--success)' },
              { label: 'Revenue (₹)',    value: `₹${stats.revenue}`, color: 'var(--warning)' },
            ].map(s => (
              <div className="card" key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        {stats?.chartData?.length > 0 && (
          <div className="card" style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 16 }}>Registrations per event</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.chartData}>
                <XAxis dataKey="name" stroke="#8a8aa0" fontSize={11} />
                <YAxis stroke="#8a8aa0" fontSize={11} />
                <Tooltip contentStyle={{ background: '#16161f', border: '1px solid #2e2e42', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#7c5cbf" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-8" style={{ marginBottom: 24 }}>
          {['events', 'add', 'users'].map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === 'users') loadUsers() }}
              className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-outline'}`}>
              {t === 'events' ? 'All Events' : t === 'add' ? '+ Add Event' : 'Users'}
            </button>
          ))}
        </div>

        {/* All events tab */}
        {tab === 'events' && (
          <div className="card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {events.map(ev => (
                <div key={ev._id} className="card" style={{ padding: '14px 18px', background: 'var(--bg-surface)' }}>
                  <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 700 }}>{ev.emoji} {ev.name}</span>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {ev.category} · {ev.department} · ₹{ev.fee} · {new Date(ev.date).toLocaleDateString()}
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteEvent(ev._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add event tab */}
        {tab === 'add' && (
          <div className="card" style={{ maxWidth: 600 }}>
            {msg.text && <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>{msg.text}</div>}
            <form onSubmit={addEvent}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Event name</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Emoji</label>
                  <input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option>Technical</option>
                    <option>Non-Technical</option>
                    <option>Workshop</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Fee (₹)</label>
                  <input type="number" min={0} value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Team size</label>
                  <input type="number" min={1} value={form.teamSize} onChange={e => setForm({ ...form, teamSize: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <button className="btn btn-primary btn-full">Add Event</button>
            </form>
          </div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div className="table-wrap card">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>College</th><th>KYC</th><th>Role</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.college}</td>
                    <td>
                      <span className={`badge ${u.kycVerified ? 'badge-success' : 'badge-warning'}`}>
                        {u.kycVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td><span className="badge badge-primary">{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
