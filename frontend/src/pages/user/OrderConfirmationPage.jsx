import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import './orderConfirmation.css'

const OrderConfirmationPage = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="container" style={{ padding: 80, textAlign: 'center' }}>Loading...</div>

  const paymentIcon = order?.payment_method === 'card' ? '💳' : order?.payment_method === 'upi' ? '📲' : '💵'
  const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="order-confirmation-page">
      <div className="container">
        <div className="confirmation-card">
          <div className="confirm-icon-wrap">
            <div className="confirm-icon">✓</div>
          </div>
          <h1>Order Confirmed!</h1>
          <p className="confirm-subtitle">Thank you for shopping with MAISON. Your order has been placed successfully.</p>

          {order && (
            <div className="order-details">
              <div className="order-detail-row">
                <span>Order Number</span>
                <strong>#MAISON-{order.id?.toString().padStart(5, '0')}</strong>
              </div>
              <div className="order-detail-row">
                <span>Payment</span>
                <strong>{paymentIcon} {order.payment_method?.toUpperCase()}</strong>
              </div>
              <div className="order-detail-row">
                <span>Total Paid</span>
                <strong>₹{Number(order.total_amount).toLocaleString('en-IN')}</strong>
              </div>
              <div className="order-detail-row">
                <span>Est. Delivery</span>
                <strong>{deliveryDate}</strong>
              </div>
              <div className="order-detail-row">
                <span>Status</span>
                <strong className="status-badge">Processing</strong>
              </div>
            </div>
          )}

          <div className="confirmation-actions">
            <Link to="/" className="btn btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmationPage