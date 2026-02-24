import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useCart } from '../../context/CartContext'
import ProductCard from '../../components/ProductCard'
import './productDetail.css'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'https://e-commerce-website-ym40.onrender.com'

const getImageUrl = (url) => {
  if (!url) return 'https://placehold.co/600x700/f5f5f5/999?text=No+Image'
  if (url.startsWith('http')) return url
  return `${API_URL}${url}`
}

const StarRating = ({ rating }) => {
  const r = parseFloat(rating) || 4.2
  return (
    <div className="star-display">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`star ${i <= Math.round(r) ? 'filled' : ''}`}>★</span>
      ))}
      <span className="rating-value">{r}</span>
    </div>
  )
}

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [relatedProducts, setRelatedProducts] = useState([])
  const [addedFeedback, setAddedFeedback] = useState(false)
  const { addToCart } = useCart()

  useEffect(() => {
    fetchProduct()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/products/${id}`)
      setProduct(data)
      // Fetch related products
      if (data.category_name) {
        const { data: rel } = await api.get(`/products?category=${encodeURIComponent(data.category_name)}&limit=4`)
        setRelatedProducts(rel.products.filter(p => p.id !== data.id).slice(0, 4))
      }
    } catch (error) {
      console.error('Failed to fetch product', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity)
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 2000)
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px' }}>
        <div className="detail-skeleton">
          <div className="skeleton" style={{ height: 500, borderRadius: 16, flex: 1 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="skeleton" style={{ height: 20, width: '40%' }} />
            <div className="skeleton" style={{ height: 40, width: '80%' }} />
            <div className="skeleton" style={{ height: 20, width: '30%' }} />
            <div className="skeleton" style={{ height: 28, width: '25%' }} />
            <div className="skeleton" style={{ height: 100 }} />
            <div className="skeleton" style={{ height: 52 }} />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return <div className="container" style={{ padding: 80 }}>Product not found</div>

  // Build images array
  const images = (product.images && product.images.length > 0)
    ? product.images.map(img => getImageUrl(img))
    : [getImageUrl(product.image_url)]

  const needsSize = ['Men\'s Fashion', 'Women\'s Fashion', 'Kids', 'Sports'].includes(product.category_name)

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb-nav">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/?category=${encodeURIComponent(product.category_name)}`}>{product.category_name}</Link>
          <span>/</span>
          <span>{product.title}</span>
        </nav>

        {/* Main Detail */}
        <div className="detail-grid">
          {/* Gallery */}
          <div className="detail-gallery">
            <div className="thumbnails">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`thumb-btn ${selectedImage === i ? 'active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img} alt={`View ${i + 1}`}
                    onError={(e) => { e.target.src = 'https://placehold.co/80x80/f5f5f5/999?text=IMG' }}
                  />
                </button>
              ))}
            </div>
            <div className="main-image-wrap">
              <img
                src={images[selectedImage]}
                alt={product.title}
                className="main-product-image"
                onError={(e) => { e.target.src = 'https://placehold.co/600x700/f5f5f5/999?text=MAISON' }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="detail-info">
            <span className="detail-category">{product.category_name}</span>
            <h1 className="detail-title">{product.title}</h1>

            <div className="detail-rating-row">
              <StarRating rating={product.rating} />
              <span className="detail-reviews">({(product.review_count || 0).toLocaleString()} reviews)</span>
            </div>

            <div className="detail-price-row">
              <span className="detail-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
              <span className="detail-tax">Inclusive of all taxes</span>
            </div>

            <div className={`detail-stock ${product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : ''}`}>
              {product.stock === 0 ? '✗ Out of Stock' : product.stock <= 5 ? `⚡ Only ${product.stock} left!` : `✓ In Stock (${product.stock} available)`}
            </div>

            {needsSize && (
              <div className="size-selector">
                <p className="size-label">Select Size</p>
                <div className="size-options">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <button key={s} className="size-btn">{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="detail-actions">
              <div className="quantity-stepper">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
              </div>
              <button
                className={`add-to-cart-btn ${addedFeedback ? 'added' : ''}`}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {addedFeedback ? '✓ Added to Cart!' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            <button className="buy-now-btn" onClick={() => { handleAddToCart(); navigate('/cart'); }}>
              Buy Now
            </button>

            {/* Highlights */}
            <div className="detail-highlights">
              <div className="highlight">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span>Free delivery on orders above ₹999</span>
              </div>
              <div className="highlight">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-5" /></svg>
                <span>30-day hassle-free returns</span>
              </div>
              <div className="highlight">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span>100% authentic products</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs">
          <div className="tab-nav">
            {['description', 'specifications', 'reviews'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {activeTab === 'description' && (
              <p>{product.description || 'No description available.'}</p>
            )}
            {activeTab === 'specifications' && (
              <table className="specs-table">
                <tbody>
                  <tr><td>Category</td><td>{product.category_name}</td></tr>
                  <tr><td>SKU</td><td>MAISON-{product.id?.toString().padStart(4, '0')}</td></tr>
                  <tr><td>Stock</td><td>{product.stock} units</td></tr>
                  <tr><td>Rating</td><td>{product.rating} / 5</td></tr>
                </tbody>
              </table>
            )}
            {activeTab === 'reviews' && (
              <div className="reviews-placeholder">
                <p className="review-summary">⭐ {product.rating} out of 5 — based on {(product.review_count || 0).toLocaleString()} reviews</p>
                <p className="no-review-note">Verified purchase reviews are displayed after purchase.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related-section">
            <p className="section-subtitle">You might also like</p>
            <h2 className="section-title">Related Products</h2>
            <div className="product-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage