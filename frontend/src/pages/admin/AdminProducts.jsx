import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import './adminProducts.css'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?limit=100') // fetch all for admin
      setProducts(data.products)
    } catch (error) {
      console.error('Failed to fetch products', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      alert('Failed to delete product')
    }
  }

  if (loading) return <div className="container loading">Loading...</div>

  return (
    <div className="admin-products">
      <div className="page-header">
         <h1>Manage Products</h1>
         <Link to="/admin/products/add" className="btn-primary">+ Add New Product</Link>
      </div>
      <table className="products-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>
                <img src={product.image_url || '/placeholder.jpg'} alt={product.title} width="50" />
              </td>
              <td>{product.title}</td>
              <td>${product.price}</td>
              <td>{product.stock}</td>
              <td>{product.category_name}</td>
              <td>
                <Link to={`/admin/products/edit/${product.id}`} className="edit-btn">Edit</Link>
                <button onClick={() => handleDelete(product.id)} className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminProducts