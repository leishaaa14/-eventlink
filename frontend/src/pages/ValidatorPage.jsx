import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import api from '../utils/api'
import Navbar from '../components/Auth/Navbar'

export default function ValidatorPage() {
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')
  const [scanning, setScanning] = useState(true)
  const scannerRef = useRef(null)

  useEffect(() => {
    if (!scanning) return
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 260 }, false)
    scanner.render(
      async decodedText => {
        await scanner.clear()
        setScanning(false)
        try {
          const { data } = await api.post('/validator/scan', { qrHash: decodedText })
          setResult(data)
        } catch (err) {
          setError(err.response?.data?.message || 'QR code is invalid or already used')
        }
      },
      () => {}
    )
    scannerRef.current = scanner
    return () => { scanner.clear().catch(() => {}) }
  }, [scanning])

  const reset = () => { setResult(null); setError(''); setScanning(true) }

  return (
    <>
      <Navbar />
      <div className="container page">
        <div style={{ maxWidth: 460, margin: '0 auto' }}>
          <h2 style={{ marginBottom: 8, textAlign: 'center' }}>QR Validator</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 28, fontSize: '0.9rem' }}>
            Scan participant QR codes to verify entry
          </p>

          {scanning && (
            <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
              <div id="reader" />
            </div>
          )}

          {error && (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>❌</div>
              <h3 style={{ color: 'var(--danger)', marginBottom: 8 }}>Invalid QR Code</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{error}</p>
              <button className="btn btn-primary" onClick={reset}>Scan Again</button>
            </div>
          )}

          {result && (
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>✅</div>
              <h3 style={{ color: 'var(--success)', marginBottom: 20 }}>Entry Verified!</h3>
              <div className="card" style={{ background: 'var(--bg-surface)', textAlign: 'left', marginBottom: 24 }}>
                {[
                  ['Name',           result.userName],
                  ['Email',          result.userEmail],
                  ['College',        result.college],
                  ['Department',     result.department],
                  ['Event',          result.eventName],
                  ['Event Date',     result.eventDate ? new Date(result.eventDate).toLocaleDateString() : '—'],
                  ['Payment',        'Confirmed ✓'],
                  ['Blockchain TX',  result.txHash ? result.txHash.slice(0, 20) + '…' : 'Recorded'],
                ].map(([k, v]) => (
                  <div key={k} className="flex" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{k}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{v}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-full" onClick={reset}>Scan Next Participant</button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
