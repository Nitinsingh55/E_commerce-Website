import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import './adminEditProduct.css'

const AdminEditProduct = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    stock: '',
    category_id: '',
    description: '',
  })
  const [image, setImage] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchCategories()
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`)
      setFormData({
        title: data.title,
        price: data.price,
        stock: data.stock,
        category_id: data.category_id,
        description: data.description || '',
      })
    } catch (error) {
      console.error('Failed to fetch product', error)
      alert('Product not found')
      navigate('/admin/products')
    } finally {
      setFetching(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories')
      if (Array.isArray(data)) {
        setCategories(data)
      } else {
        console.error('Categories data is not an array:', data)
        setCategories([])
      }
    } catch (error) {
      console.error('Failed to fetch categories', error)
      setCategories([])
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    setImage(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const data = new FormData()
    Object.keys(formData).forEach(key => data.append(key, formData[key]))
    if (image) data.append('images', image)

    try {
      await api.put(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate('/admin/products')
    } catch (error) {
      console.error('Failed to update product', error)
      alert('Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="container loading">Loading...</div>

  return (
    <div className="admin-edit-product">
      <h1>Edit Product</h1>
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label>Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Price ($)</label>
            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-group">
          <label>Category</label>
          <select name="category_id" value={formData.category_id} onChange={handleChange} required>
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="4" />
        </div>
        <div className="form-group">
          <label>Product Image (leave empty to keep current)</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Updating...' : 'Update Product'}
        </button>
      </form>
    </div>
  )
}

export default AdminEditProduct