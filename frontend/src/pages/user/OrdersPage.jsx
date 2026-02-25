import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api, { getImageUrl } from '../../services/api'
import './orders.css'

const OrdersPage = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/my')
            setOrders(data || [])
            setLoading(false)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch orders')
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'Processing', class: 'status-pending' },
            processing: { label: 'Processing', class: 'status-pending' },
            shipped: { label: 'Shipped', class: 'status-shipped' },
            delivered: { label: 'Delivered', class: 'status-delivered' },
            cancelled: { label: 'Cancelled', class: 'status-cancelled' }
        }
        const mapped = statusMap[status?.toLowerCase()] || statusMap.pending
        return <span className={`status-badge ${mapped.class}`}>{mapped.label}</span>
    }

    const getExpectedDelivery = (dateString) => {
        const orderDate = new Date(dateString)
        orderDate.setDate(orderDate.getDate() + 5) // Estimated 5 days delivery
        return orderDate.toLocaleDateString('en-IN', {
            weekday: 'short', month: 'short', day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="orders-page-loading">
                <div className="spinner"></div>
                <p>Loading your orders...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="orders-page-error container">
                <div className="error-icon">⚠️</div>
                <h2>Oops!</h2>
                <p>{error}</p>
                <button onClick={fetchOrders} className="btn btn-primary">Try Again</button>
            </div>
        )
    }

    return (
        <div className="orders-page fade-in">
            <div className="container">
                <div className="orders-header">
                    <Link to="/" className="back-link">← Continue Shopping</Link>
                    <h1 className="orders-title">My Orders</h1>
                    <p className="orders-subtitle">View and track your previous purchases</p>
                </div>

                {(!orders || orders.length === 0) ? (
                    <div className="empty-orders-view">
                        <div className="empty-icon">📦</div>
                        <h2>No orders yet</h2>
                        <p>Looks like you haven't made your first purchase.</p>
                        <Link to="/" className="btn btn-primary">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order.id} className="order-card slide-up">
                                <div className="order-card-header">
                                    <div className="order-meta">
                                        <div className="meta-item">
                                            <span className="meta-label">Order Placed</span>
                                            <span className="meta-value">
                                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                    year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="meta-label">Total Amount</span>
                                            <span className="meta-value amount">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="meta-item mobile-hidden">
                                            <span className="meta-label">Order ID</span>
                                            <span className="meta-value order-id">#{order.id.slice(0, 8)}...</span>
                                        </div>
                                    </div>
                                    <div className="order-actions">
                                        <Link to={`/order-confirmation/${order.id}`} className="btn-view-details">
                                            Order Details →
                                        </Link>
                                    </div>
                                </div>

                                <div className="order-status-banner">
                                    <div className="status-info">
                                        {getStatusBadge(order.status)}
                                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                            <span className="delivery-estimate">
                                                Expected Delivery: <strong>{getExpectedDelivery(order.created_at)}</strong>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="order-items-list">
                                    {order.items && order.items.map((item, idx) => (
                                        <div key={idx} className="order-item-row">
                                            <div className="item-image-wrapper">
                                                <img
                                                    src={getImageUrl(item.image_url)}
                                                    alt={item.product_title}
                                                    className="item-img"
                                                />
                                            </div>
                                            <div className="item-details">
                                                <h4 className="item-title">{item.product_title}</h4>
                                                <div className="item-price-qty">
                                                    <span className="item-price">₹{parseFloat(item.price_at_time).toLocaleString('en-IN')}</span>
                                                    <span className="item-qty">Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="item-actions">
                                                <Link to={`/product/${item.product_id}`} className="btn-buy-again">
                                                    Buy Again
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrdersPage
