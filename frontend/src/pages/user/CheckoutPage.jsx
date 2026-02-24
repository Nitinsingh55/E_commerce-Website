import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import api from '../../services/api'
import './checkout.css'

const STEPS = ['Shipping', 'Payment', 'Review']

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { cart, clearCart } = useCart()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  // Shipping
  const [shipping, setShipping] = useState({
    fullName: '', phone: '', address: '', city: '', state: '', pin: ''
  })

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardDetails, setCardDetails] = useState({
    number: '', name: '', expiry: '', cvv: ''
  })
  const [upiId, setUpiId] = useState('')
  const [cardFlipped, setCardFlipped] = useState(false)

  const subtotal = cart?.items?.reduce((s, i) => s + i.product.price * i.quantity, 0) || 0
  const shipping_cost = subtotal > 999 ? 0 : 79
  const total = subtotal + shipping_cost

  const handleShippingChange = (e) => setShipping({ ...shipping, [e.target.name]: e.target.value })
  const handleCardChange = (e) => setCardDetails({ ...cardDetails, [e.target.name]: e.target.value })

  const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length >= 2 ? d.slice(0, 2) + '/' + d.slice(2) : d
  }

  const handlePlaceOrder = async () => {
    setProcessingPayment(true)
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 2500))
    setLoading(true)
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: `${shipping.fullName}, ${shipping.address}, ${shipping.city}, ${shipping.state} - ${shipping.pin}. Phone: ${shipping.phone}`,
        paymentMethod,
      })
      clearCart()
      navigate(`/order-confirmation/${data.id}`)
    } catch (error) {
      alert('Order placement failed. Please try again.')
      setLoading(false)
      setProcessingPayment(false)
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="checkout-empty">
        <div className="container">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some products before checking out</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Products</button>
        </div>
      </div>
    )
  }

  if (processingPayment) {
    return (
      <div className="payment-processing">
        <div className="processing-card">
          <div className="processing-spinner" />
          <h2>Processing Payment</h2>
          <p>Please do not close this window...</p>
          <div className="processing-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        {/* Progress Bar */}
        <div className="checkout-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`step-item ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="step-number">{i < step ? '✓' : i + 1}</div>
              <span>{s}</span>
              {i < STEPS.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <div className="checkout-grid">
          {/* Left Panel */}
          <div className="checkout-left">
            {/* Step 0: Shipping */}
            {step === 0 && (
              <div className="checkout-card fade-in">
                <h3>Delivery Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input name="fullName" value={shipping.fullName} onChange={handleShippingChange} placeholder="John Doe" required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input name="phone" value={shipping.phone} onChange={handleShippingChange} placeholder="+91 98765 43210" required />
                  </div>
                  <div className="form-group full-width">
                    <label>Street Address</label>
                    <input name="address" value={shipping.address} onChange={handleShippingChange} placeholder="House No., Street Name, Area" required />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input name="city" value={shipping.city} onChange={handleShippingChange} placeholder="Mumbai" required />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input name="state" value={shipping.state} onChange={handleShippingChange} placeholder="Maharashtra" required />
                  </div>
                  <div className="form-group">
                    <label>PIN Code</label>
                    <input name="pin" value={shipping.pin} onChange={handleShippingChange} placeholder="400001" maxLength="6" required />
                  </div>
                </div>
                <button
                  className="btn btn-primary checkout-next-btn"
                  onClick={() => setStep(1)}
                  disabled={!shipping.fullName || !shipping.address || !shipping.city || !shipping.pin}
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="checkout-card fade-in">
                <h3>Payment Method</h3>

                {/* Method Selector */}
                <div className="payment-methods">
                  {[
                    { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
                    { id: 'upi', label: 'UPI Payment', icon: '📲' },
                    { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
                  ].map(m => (
                    <label key={m.id} className={`payment-method-option ${paymentMethod === m.id ? 'selected' : ''}`}>
                      <input type="radio" name="paymentMethod" value={m.id}
                        checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} />
                      <span className="pm-icon">{m.icon}</span>
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>

                {/* Card Details */}
                {paymentMethod === 'card' && (
                  <div className="card-form">
                    {/* Visual Card */}
                    <div className={`card-visual ${cardFlipped ? 'flipped' : ''}`}>
                      <div className="card-front">
                        <div className="card-chip">
                          <div className="chip-lines"></div>
                        </div>
                        <div className="card-number">{cardDetails.number || '•••• •••• •••• ••••'}</div>
                        <div className="card-info-row">
                          <div>
                            <small>Card Holder</small>
                            <p>{cardDetails.name || 'YOUR NAME'}</p>
                          </div>
                          <div>
                            <small>Expires</small>
                            <p>{cardDetails.expiry || 'MM/YY'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="card-back">
                        <div className="card-stripe" />
                        <div className="card-cvv-wrap">
                          <span>{cardDetails.cvv || '•••'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label>Card Number</label>
                        <input
                          value={formatCard(cardDetails.number)}
                          onChange={e => handleCardChange({ target: { name: 'number', value: e.target.value.replace(/\s/g, '') } })}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Name on Card</label>
                        <input name="name" value={cardDetails.name} onChange={handleCardChange} placeholder="John Doe" />
                      </div>
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input
                          value={cardDetails.expiry}
                          onChange={e => handleCardChange({ target: { name: 'expiry', value: formatExpiry(e.target.value) } })}
                          placeholder="MM/YY"
                          maxLength="5"
                        />
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input
                          name="cvv" type="password"
                          value={cardDetails.cvv}
                          onChange={handleCardChange}
                          placeholder="•••"
                          maxLength="3"
                          onFocus={() => setCardFlipped(true)}
                          onBlur={() => setCardFlipped(false)}
                        />
                      </div>
                    </div>
                    <p className="test-notice">🔒 Test Mode — No real payment will be charged</p>
                  </div>
                )}

                {/* UPI Details */}
                {paymentMethod === 'upi' && (
                  <div className="upi-form">
                    <div className="form-group">
                      <label>UPI ID</label>
                      <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" />
                    </div>
                    <p className="test-notice">🔒 Test Mode — No real payment will be charged</p>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="cod-notice">
                    <p>💵 Pay with cash when your order arrives. No extra charges.</p>
                  </div>
                )}

                <div className="checkout-btn-row">
                  <button className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(2)}>Review Order →</button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="checkout-card fade-in">
                <h3>Review Your Order</h3>

                <div className="review-section">
                  <h4>Delivery To</h4>
                  <p className="review-address">
                    {shipping.fullName} — {shipping.phone}<br />
                    {shipping.address}, {shipping.city}, {shipping.state} - {shipping.pin}
                  </p>
                  <button className="edit-btn" onClick={() => setStep(0)}>Edit</button>
                </div>

                <div className="review-section">
                  <h4>Payment</h4>
                  <p>
                    {paymentMethod === 'card' && `💳 Card ending in ${cardDetails.number.slice(-4) || '****'}`}
                    {paymentMethod === 'upi' && `📲 UPI: ${upiId || 'Not provided'}`}
                    {paymentMethod === 'cod' && '💵 Cash on Delivery'}
                  </p>
                  <button className="edit-btn" onClick={() => setStep(1)}>Edit</button>
                </div>

                <button
                  className="btn btn-primary place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? 'Placing Order...' : `Confirm & Pay ₹${total.toLocaleString('en-IN')}`}
                </button>
                <p className="secure-note">🔒 Secured by 256-bit SSL encryption</p>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-right">
            <div className="order-summary-card">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {cart.items.map(item => (
                  <div key={item.id} className="summary-item">
                    <div className="summary-item-info">
                      <span className="summary-qty">{item.quantity}×</span>
                      <span className="summary-name">{item.product.title}</span>
                    </div>
                    <span className="summary-price">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="summary-breakdown">
                <div className="breakdown-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="breakdown-row">
                  <span>Shipping</span>
                  <span>{shipping_cost === 0 ? <span className="free-badge">FREE</span> : `₹${shipping_cost}`}</span>
                </div>
                <div className="breakdown-row total">
                  <strong>Total</strong>
                  <strong>₹{total.toLocaleString('en-IN')}</strong>
                </div>
              </div>
              {shipping_cost === 0 && (
                <p className="free-shipping-note">🎉 You qualify for free shipping!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage