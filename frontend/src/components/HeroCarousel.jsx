import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './HeroCarousel.css'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'https://e-commerce-website-ym40.onrender.com'

const slides = [
  {
    category: "Women's Fashion",
    headline: "New Season Arrivals",
    subtext: "Discover the latest trends in women's fashion",
    cta: "Shop Women",
    bg: "#f8f6f3",
    accent: "#8b7355",
    image: `${API_URL}/uploads/hero-womens-fashion.jpg`,
  },
  {
    category: "Electronics",
    headline: "Tech That Moves You",
    subtext: "Premium gadgets for the modern lifestyle",
    cta: "Shop Electronics",
    bg: "#f0f4f8",
    accent: "#2c5282",
    image: `${API_URL}/uploads/hero-electronics.jpg`,
  },
  {
    category: "Home & Living",
    headline: "Design Your Space",
    subtext: "Beautiful pieces for every room",
    cta: "Shop Home",
    bg: "#f5f5f0",
    accent: "#5a6a52",
    image: `${API_URL}/uploads/hero-home-living.jpg`,
  },
  {
    category: "Sports",
    headline: "Gear Up & Go",
    subtext: "High-performance gear for active lifestyles",
    cta: "Shop Sports",
    bg: "#f4f0f8",
    accent: "#553c7b",
    image: `${API_URL}/uploads/hero-sports.jpg`,
  },
]


const HeroCarousel = () => {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const navigate = useNavigate()

  const goTo = useCallback((idx) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrent(idx)
    setTimeout(() => setIsAnimating(false), 500)
  }, [isAnimating])

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const slide = slides[current]

  return (
    <div className="hero-carousel" style={{ background: slide.bg }}>
      <div className="hero-content">
        <div className="hero-text" key={current}>
          <p className="hero-eyebrow" style={{ color: slide.accent }}>
            New Collection 2026
          </p>
          <h1 className="hero-headline">{slide.headline}</h1>
          <p className="hero-subtext">{slide.subtext}</p>
          <button
            className="hero-cta"
            style={{ background: slide.accent }}
            onClick={() => navigate(`/?category=${encodeURIComponent(slide.category)}`)}
          >
            {slide.cta}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="hero-image-wrap">
          <img
            src={slide.image}
            alt={slide.headline}
            className="hero-image"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
      </div>

      {/* Dots */}
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? 'active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button className="hero-arrow prev" onClick={() => goTo((current - 1 + slides.length) % slides.length)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button className="hero-arrow next" onClick={next}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  )
}

export default HeroCarousel