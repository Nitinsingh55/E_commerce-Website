import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './register.css'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-left">
        <div className="register-brand">
          <Link to="/" className="register-logo">MAISON</Link>
          <p className="register-brand-sub">Curated Living</p>
        </div>
        <div className="register-left-content">
          <h2>Join the<br />MAISON family.</h2>
          <p>Create an account to enjoy exclusive deals, track your orders, and discover your perfect style.</p>
          <div className="register-perks">
            <div className="perk">✓ Free delivery on first order</div>
            <div className="perk">✓ Early access to new arrivals</div>
            <div className="perk">✓ Easy returns & exchanges</div>
          </div>
        </div>
        <div className="register-left-decor">
          <div className="decor-circle c1"></div>
          <div className="decor-circle c2"></div>
        </div>
      </div>

      <div className="register-right">
        <div className="register-form-wrap">
          <div className="register-form-header">
            <h1>Create Account</h1>
            <p>Already have one? <Link to="/login">Sign in</Link></p>
          </div>

          {error && (
            <div className="login-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="reg-pass">Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="reg-pass" name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required style={{ width: '100%', paddingRight: 40 }}
                />
                <button type="button" className="toggle-pass" style={{ position: 'absolute', right: 12 }} onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirm-pass">Confirm Password</label>
              <input
                id="confirm-pass" name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                required
              />
            </div>

            <button type="submit" className="register-submit-btn" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className="register-terms">
            By creating an account you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage