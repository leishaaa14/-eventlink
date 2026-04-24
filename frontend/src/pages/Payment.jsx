import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Auth/Navbar'

export default function Payment() {
  const { eventId } = useParams()
  const navigate    = useNavigate()
  const [event, setEvent]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get(`/events/${eventId}`).then(r => setEvent(r.data))
  }, [eventId])

  const handlePay = async () => {
    setLoading(true); setError('')
    try {
      // Step 1 — create order on backend
      const { data: order } = await api.post('/payments/create-order', { eventId })

      // Step 2 — open Razorpay checkout modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'Eventlink',
        description: `Registration: ${event?.name}`,
        order_id: order.id,
        handler: async response => {
          // Step 3 — verify signature on backend → generates QR + writes to blockchain
          await api.post('/payments/verify', {
            eventId,
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          })
          navigate('/qrcodes')
        },
        prefill: {},
        theme: { color: '#7c5cbf' },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', e => setError(e.error.description))
      rzp.open()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment')
    } finally { setLoading(false) }
  }

  if (!event) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <>
      <Navbar />
      <div className="container page">
        <div className="auth-card card">
          <h2 style={{ marginBottom: 24 }}>Complete Payment</h2>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="card" style={{ marginBottom: 24, background: 'var(--bg-surface)' }}>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>{event.name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 4 }}>
              {event.category} · {event.department}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {event.location} · {new Date(event.date).toLocaleDateString()} · {event.time}
            </p>
            <hr className="divider" />
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Registration fee</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-light)' }}>
                ₹{event.fee}
              </span>
            </div>
          </div>

          <button className="btn btn-primary btn-full" onClick={handlePay} disabled={loading}>
            {loading ? 'Opening Razorpay…' : `Pay ₹${event.fee} with Razorpay`}
          </button>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
            🔒 Secure payment via Razorpay · QR code generated after confirmation
          </p>
        </div>
      </div>
    </>
  )
}
