import { useState, useEffect } from 'react'
import api from '../utils/api'
import Navbar from '../components/Auth/Navbar'

export default function QRCodes() {
  const [qrs, setQrs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/qrcodes').then(r => { setQrs(r.data); setLoading(false) })
  }, [])

  const download = (dataUrl, name) => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${name.replace(/\s+/g, '-')}-qr.png`
    a.click()
  }

  return (
    <>
      <Navbar />
      <div className="container page">
        <h2 style={{ marginBottom: 8 }}>My QR Codes</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
          Present these at event entry for instant check-in
        </p>

        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : qrs.length === 0
            ? (
              <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎫</div>
                <p style={{ color: 'var(--text-muted)' }}>
                  No QR codes yet. Register and complete payment for an event to get your QR code.
                </p>
              </div>
            )
            : (
              <div className="grid-3">
                {qrs.map(q => (
                  <div className="card qr-card" key={q._id}>
                    <h3>{q.eventName}</h3>
                    <p>{q.department} · {new Date(q.eventDate).toLocaleDateString()}</p>
                    <div className="qr-wrapper" style={{ margin: '0 auto 20px' }}>
                      <img src={q.qrDataUrl} alt={`QR for ${q.eventName}`} width={180} height={180} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16, wordBreak: 'break-all' }}>
                      Hash: {q.qrHash?.slice(0, 20)}…
                    </div>
                    <div className="flex gap-8" style={{ justifyContent: 'center' }}>
                      <button className="btn btn-primary btn-sm"
                        onClick={() => download(q.qrDataUrl, q.eventName)}>
                        Download
                      </button>
                      <span className={`badge ${q.validated ? 'badge-success' : 'badge-warning'}`}>
                        {q.validated ? '✓ Used' : 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
        }
      </div>
    </>
  )
}
