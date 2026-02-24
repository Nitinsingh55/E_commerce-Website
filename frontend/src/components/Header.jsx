import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './Header.css'

const Header = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoryMenu, setCategoryMenu] = useState(null)
  const headerRef = useRef(null)

  const itemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  const categories = [
    { name: "Men's Fashion", key: "Men's Fashion", icon: "👔" },
    { name: "Women's Fashion", key: "Women's Fashion", icon: "👗" },
    { name: "Kids", key: "Kids", icon: "🧸" },
    { name: "Home & Living", key: "Home & Living", icon: "🏠" },
    { name: "Beauty", key: "Beauty", icon: "✨" },
    { name: "Electronics", key: "Electronics", icon: "📱" },
    { name: "Sports", key: "Sports", icon: "⚽" },
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
      setMobileMenuOpen(false)
    }
  }

  const handleCategoryClick = (categoryKey) => {
    navigate(`/?category=${encodeURIComponent(categoryKey)}`)
    setCategoryMenu(null)
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setCategoryMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="header" ref={headerRef}>
      {/* Top promo bar */}
      <div className="header-promo">
        <span>✦ Free shipping on orders over ₹999</span>
        <span>✦ Use code MAISON10 for 10% off</span>
        <span>✦ 30-day easy returns</span>
      </div>

      {/* Main header */}
      <div className="header-main">
        <div className="container header-main-inner">
          {/* Logo */}
          <Link to="/" className="header-logo" onClick={() => setMobileMenuOpen(false)}>
            <span className="logo-text">MAISON</span>
            <span className="logo-tagline">Curated Living</span>
          </Link>

          {/* Search */}
          <form
            className={`header-search ${isSearchFocused ? 'focused' : ''}`}
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>

          {/* Actions */}
          <div className="header-actions">
            {isAuthenticated ? (
              <div className="user-menu">
                <button className="user-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="user-name">{user?.name?.split(' ')[0]}</span>
                </button>
                <div className="user-dropdown">
                  {isAdmin && <Link to="/admin" className="dropdown-item">Admin Panel</Link>}
                  <button className="dropdown-item" onClick={logout}>Logout</button>
                </div>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="auth-link">Login</Link>
                <Link to="/register" className="auth-link btn-register">Register</Link>
              </div>
            )}
            <Link to="/cart" className="cart-btn" aria-label="Cart">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Category Nav */}
      <nav className="header-nav">
        <div className="container">
          <ul className="nav-list">
            <li>
              <button className="nav-link" onClick={() => navigate('/')}>All</button>
            </li>
            {categories.map(cat => (
              <li key={cat.key} className="nav-item">
                <button
                  className="nav-link"
                  onClick={() => handleCategoryClick(cat.key)}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-inner">
          {categories.map(cat => (
            <button key={cat.key} className="mobile-cat-link" onClick={() => handleCategoryClick(cat.key)}>
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
          <div className="mobile-divider" />
          {isAuthenticated ? (
            <>
              {isAdmin && <Link to="/admin" className="mobile-cat-link" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>}
              <button className="mobile-cat-link" onClick={() => { logout(); setMobileMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-cat-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-cat-link" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header