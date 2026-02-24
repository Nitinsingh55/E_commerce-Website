import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './ProductCard.css'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'https://e-commerce-website-ym40.onrender.com'

const getImageUrl = (url) => {
  if (!url) return 'https://placehold.co/400x500/f5f5f5/999?text=No+Image'
  if (url.startsWith('http')) return url
  return `${API_URL}${url}`
}

const StarRating = ({ rating }) => {
  const stars = []
  const full = Math.floor(rating || 4)
  const half = (rating || 4) % 1 >= 0.5
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push('★')
    else if (i === full && half) stars.push('✦')
    else stars.push('☆')
  }
  return <span className="stars">{stars.join('')}</span>
}

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product.id, 1)
  }

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="card-image-wrap">
        <img
          src={getImageUrl(product.image_url)}
          alt={product.title}
          className="card-image"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://placehold.co/400x500/f5f5f5/999?text=MAISON' }}
        />
        {discount && <span className="card-discount-badge">-{discount}%</span>}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="card-low-stock">Only {product.stock} left!</span>
        )}
        {product.stock === 0 && (
          <span className="card-out-of-stock">Out of Stock</span>
        )}
        <div className="card-overlay">
          <button
            className="card-add-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Sold Out' : '+ Add to Cart'}
          </button>
        </div>
      </div>
      <div className="card-body">
        <span className="card-category">{product.category_name}</span>
        <h3 className="card-title">{product.title}</h3>
        <div className="card-rating">
          <StarRating rating={product.rating} />
          <span className="rating-count">({(product.review_count || 0).toLocaleString()})</span>
        </div>
        <div className="card-price-row">
          <span className="card-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
          {discount && (
            <span className="card-orig-price">₹{Number(product.original_price).toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard