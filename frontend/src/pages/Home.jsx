import { Link } from 'react-router-dom'
import Navbar from '../components/Auth/Navbar'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-badge">Blockchain-powered event registration</div>
            <h1 className="hero-title">Register. Pay. Check in.<br /><span>Instantly.</span></h1>
            <p className="hero-sub">
              Tamper-proof QR codes backed by Ethereum. No manual verification,
              no lost records, no queues.
            </p>
            <div className="flex gap-16" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary">Get started</Link>
              <Link to="/events" className="btn btn-outline">Browse events</Link>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <div className="grid-3">
              {[
                { icon: '🔐', title: 'Secure by default',
                  desc: 'SHA-256 QR codes timestamped and written to Ethereum — impossible to forge.' },
                { icon: '⚡', title: 'Instant check-in',
                  desc: 'Scan QR at the gate. Validated against blockchain in milliseconds.' },
                { icon: '📊', title: 'Live analytics',
                  desc: 'Organizers see registrations, payments, and attendance in real time.' },
              ].map(f => (
                <div className="card card-hover feature-card" key={f.title}>
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
