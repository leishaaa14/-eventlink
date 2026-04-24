import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Auth/Navbar'

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep]     = useState(1)
  const [form, setForm]     = useState({ name: '', email: '', password: '', phone: '', college: '', department: '' })
  const [otp, setOtp]       = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/auth/signup', form)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    } finally { setLoading(false) }
  }

  const handleVerify = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/auth/verify-otp', { email: form.email, otp })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="auth-card card">
          <h2 style={{ marginBottom: 8 }}>Create account</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
            {step === 1 ? 'Join Eventlink to register for events' : `Enter the OTP sent to ${form.email}`}
          </p>
          {error && <div className="alert alert-error">{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleSignup}>
              {[
                { key: 'name',       label: 'Full name',   type: 'text' },
                { key: 'email',      label: 'Email',       type: 'email' },
                { key: 'phone',      label: 'Phone',       type: 'tel' },
                { key: 'college',    label: 'College',     type: 'text' },
                { key: 'department', label: 'Department',  type: 'text' },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input type={f.type} required value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" required minLength={6}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <button className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Sending OTP…' : 'Continue →'}
              </button>
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--primary-light)' }}>Login</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label className="form-label">OTP Code</label>
                <input type="text" maxLength={6} required placeholder="6-digit code"
                  value={otp} onChange={e => setOtp(e.target.value)}
                  style={{ fontSize: '1.4rem', letterSpacing: '0.5em', textAlign: 'center' }} />
              </div>
              <button className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & Continue'}
              </button>
              <button type="button" className="btn btn-outline btn-full mt-16"
                onClick={() => setStep(1)}>Back</button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
