import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './login.css'

const LoginPage = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPass, setShowPass] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const data = await login(email, password)
            if (data.user?.role === 'admin') {
                navigate('/admin')
            } else {
                navigate('/')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-brand">
                    <Link to="/" className="login-logo">MAISON</Link>
                    <p className="login-brand-subtitle">Curated Living</p>
                </div>
                <div className="login-left-content">
                    <h2>Welcome back to<br />your wardrobe.</h2>
                    <p>Sign in to access your orders, wishlist and personalized recommendations.</p>
                </div>
                <div className="login-left-decor">
                    <div className="decor-circle c1"></div>
                    <div className="decor-circle c2"></div>
                    <div className="decor-circle c3"></div>
                </div>
            </div>

            <div className="login-right">
                <div className="login-form-wrap">
                    <div className="login-form-header">
                        <h1>Sign In</h1>
                        <p>Don't have an account? <Link to="/register">Create one</Link></p>
                    </div>

                    {error && (
                        <div className="login-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Your password"
                                    required
                                    autoComplete="current-password"
                                />
                                <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="login-submit-btn" disabled={loading}>
                            {loading ? (
                                <span className="btn-spinner"></span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="login-divider"><span>or</span></div>

                    <div className="login-guest">
                        <Link to="/" className="guest-btn">Continue as Guest</Link>
                    </div>

                    <p className="admin-note">
                        Admin? <Link to="/admin/login">Admin Login →</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
