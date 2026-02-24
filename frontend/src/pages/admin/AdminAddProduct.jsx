import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import './adminAddProduct.css'

const AdminAddProduct = () => {
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

  useEffect(() => {
    fetchCategories()
  }, [])

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
    if (image) data.append('image', image)

    try {
      await api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate('/admin/products')
    } catch (error) {
      console.error('Failed to add product', error)
      alert('Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-add-product">
      <h1>Add New Product</h1>
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
          <label>Product Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  )
}

export default AdminAddProduct