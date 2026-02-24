import { useState, useEffect } from 'react'
import api from '../../services/api'
import './adminCategories.css'

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/products/categories')
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch categories', error)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
        if (editingId) {
            await api.put(`/categories/${editingId}`, formData)
        } else {
            await api.post('/categories', formData)
        }
        setFormData({ name: '', description: '' })
        setEditingId(null)
        fetchCategories()
    } catch (error) {
        alert(error.response?.data?.message || 'Failed to save category')
    } finally {
        setLoading(false)
    }
  }

  const handleEdit = (cat) => {
    setFormData({ name: cat.name, description: cat.description || '' })
    setEditingId(cat.id)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await api.delete(`/categories/${id}`)
      fetchCategories()
    } catch (error) {
      alert('Failed to delete category')
    }
  }

  return (
    <div className="admin-categories">
      <h1>Manage Categories</h1>
      <form onSubmit={handleSubmit} className="category-form">
        <input
          type="text"
          name="name"
          placeholder="Category Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="description"
          placeholder="Description (optional)"
          value={formData.description}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {editingId ? 'Update' : 'Add'} Category
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', description: '' }); }}>
            Cancel
          </button>
        )}
      </form>

      <table className="categories-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>{cat.description}</td>
              <td>
                <button onClick={() => handleEdit(cat)}>Edit</button>
                <button onClick={() => handleDelete(cat.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminCategories