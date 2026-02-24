import { useCart } from '../../context/CartContext'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../../services/api'
import './cart.css'

const CartPage = () => {
  const { cart, updateQuantity, removeItem } = useCart()

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container cart-empty">
        <h2>Your cart is empty</h2>
        <Link to="/" className="continue-shopping">Continue Shopping</Link>
      </div>
    )
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <div className="cart-page container">
      <h1>Shopping Cart</h1>
      <div className="cart-grid">
        <div className="cart-items">
          {cart.items.map(item => (
            <div key={item.id} className="cart-item">
              <img 
                src={getImageUrl(item.product.image_url)} 
                alt={item.product.title} 
              />
              <div className="item-details">
                <h3>{item.product.title}</h3>
                <p>₹{item.product.price}</p>
              </div>
              <div className="item-quantity">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>+</button>
              </div>
              <div className="item-total">
                ₹{(item.product.price * item.quantity).toFixed(2)}
              </div>
              <button className="remove-btn" onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="checkout-btn">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  )
}

export default CartPage