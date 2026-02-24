import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import HeroCarousel from '../../components/HeroCarousel'
import CategoryStrip from '../../components/CategoryStrip'
import ProductCard from '../../components/ProductCard'
import Pagination from '../../components/Pagination'
import './home.css'

const ProductSkeleton = () => (
  <div className="product-skeleton">
    <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: '10px', marginBottom: 12 }} />
    <div className="skeleton" style={{ height: 12, width: '60%', margin: '8px 0' }} />
    <div className="skeleton" style={{ height: 14, width: '80%', margin: '4px 0' }} />
    <div className="skeleton" style={{ height: 18, width: '40%', margin: '6px 0' }} />
  </div>
)

const HomePage = () => {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''

  useEffect(() => {
    setCurrentPage(1)
  }, [search, category])

  useEffect(() => {
    fetchProducts()
  }, [currentPage, search, category])

  useEffect(() => {
    fetchFeatured()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = { page: currentPage, limit: 12 }
      if (search) params.search = search
      if (category) params.category = category
      const { data } = await api.get('/products', { params })
      setProducts(data.products)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Failed to fetch products', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFeatured = async () => {
    try {
      const { data } = await api.get('/products?limit=4&page=1')
      setFeaturedProducts(data.products)
      const { data: d2 } = await api.get('/products?limit=4&page=2')
      setNewArrivals(d2.products)
    } catch (error) {
      console.error('Failed to fetch featured', error)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isFiltered = search || category

  return (
    <div className="home-page">
      {!isFiltered && <HeroCarousel />}

      <div className="container">
        <CategoryStrip />

        {!isFiltered && (
          <>
            {/* Featured Section */}
            <section className="home-section">
              <div className="section-header">
                <div>
                  <p className="section-subtitle">Handpicked for you</p>
                  <h2 className="section-title">Featured Products</h2>
                </div>
                <a href="/?page=1" className="view-all-link">View All →</a>
              </div>
              <div className="product-grid">
                {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>

            {/* Banner */}
            <div className="promo-banner">
              <div className="promo-banner-content">
                <p className="promo-eyebrow">Limited Time Offer</p>
                <h3>Get 10% Off Your First Order</h3>
                <p>Use code <strong>MAISON10</strong> at checkout</p>
              </div>
            </div>

            {/* New Arrivals */}
            <section className="home-section">
              <div className="section-header">
                <div>
                  <p className="section-subtitle">Just dropped</p>
                  <h2 className="section-title">New Arrivals</h2>
                </div>
              </div>
              <div className="product-grid">
                {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          </>
        )}

        {/* Main Listing */}
        <section className="home-section" id="product-listing">
          <div className="section-header">
            <div>
              {category && <p className="section-subtitle">Category</p>}
              <h2 className="section-title">
                {search ? `Results for "${search}"` : category ? category : 'All Products'}
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try a different search term or browse our categories</p>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default HomePage