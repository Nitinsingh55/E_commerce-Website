import { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    } else {
      setCart(null)
    }
  }, [isAuthenticated])

  const fetchCart = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/cart')
      setCart(data)
    } catch (error) {
      console.error('Failed to fetch cart', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart')
      return
    }
    try {
      const { data } = await api.post('/cart/add', { productId, quantity })
      setCart(data)
    } catch (error) {
      console.error('Failed to add to cart', error)
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/update/${itemId}`, { quantity })
      setCart(data)
    } catch (error) {
      console.error('Failed to update quantity', error)
    }
  }

  const removeItem = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/remove/${itemId}`)
      setCart(data)
    } catch (error) {
      console.error('Failed to remove item', error)
    }
  }

  const clearCart = () => {
    setCart(null)
  }

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}