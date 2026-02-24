import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './CategoryStrip.css'

const CATEGORY_ICONS = {
  "Men's Fashion": "👔",
  "Women's Fashion": "👗",
  "Kids": "🧸",
  "Home & Living": "🏠",
  "Beauty": "✨",
  "Electronics": "📱",
  "Sports": "⚽",
}

const CategoryStrip = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => { })
  }, [])

  return (
    <div className="category-strip">
      <div className="category-strip-inner">
        {categories.map(cat => (
          <button
            key={cat.id}
            className="cat-pill"
            onClick={() => navigate(`/?category=${encodeURIComponent(cat.name)}`)}
          >
            <span className="cat-icon">{CATEGORY_ICONS[cat.name] || '🛍️'}</span>
            <span className="cat-name">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryStrip