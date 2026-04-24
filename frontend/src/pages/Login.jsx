import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Auth/Navbar'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'admin')     navigate('/admin')
      else if (user.role === 'validator') navigate('/validate')
      else navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="auth-card card">
          <h2 style={{ marginBottom: 8 }}>Welcome back</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
            Sign in to your Eventlink account
          </p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              No account?{' '}
              <Link to="/signup" style={{ color: 'var(--primary-light)' }}>Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}
