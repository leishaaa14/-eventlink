import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Auth/Navbar'

export default function BookedEvents() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/bookings/mine').then(r => { setBookings(r.data); setLoading(false) })
  }, [])

  return (
    <>
      <Navbar />
      <div className="container page">
        <h2 style={{ marginBottom: 24 }}>My Bookings</h2>
        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : bookings.length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>No bookings yet. Browse events to register.</p>
            : (
              <div className="table-wrap card">
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Fee</th>
                      <th>Payment</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b._id}>
                        <td style={{ fontWeight: 600 }}>{b.event?.name}</td>
                        <td><span className="badge badge-primary">{b.event?.category}</span></td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {b.event?.date ? new Date(b.event.date).toLocaleDateString() : '—'}
                        </td>
                        <td>₹{b.event?.fee}</td>
                        <td>
                          <span className={`badge ${b.paid ? 'badge-success' : 'badge-warning'}`}>
                            {b.paid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          {b.paid
                            ? <Link to="/qrcodes" className="btn btn-outline btn-sm">View QR</Link>
                            : <Link to={`/payment/${b.event?._id}`} className="btn btn-accent btn-sm">Pay Now</Link>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
      </div>
    </>
  )
}
