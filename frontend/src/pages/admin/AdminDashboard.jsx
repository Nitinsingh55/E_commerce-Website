import { useState, useEffect } from 'react'
import api from '../../services/api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts'
import './adminDashboard.css'

const StatCard = ({ label, value, icon, sub }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <p className="stat-label">{label}</p>
      <h2 className="stat-value">{value}</h2>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  </div>
)

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const chartData = stats?.dailySales?.map(d => ({
    name: d.day,
    sales: parseFloat(d.sales),
    orders: parseInt(d.orders),
  })) || []

  if (loading) return (
    <div className="admin-page">
      <div className="admin-page-header"><h1>Dashboard</h1></div>
      <div className="stats-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card skeleton" style={{ height: 100 }} />
        ))}
      </div>
    </div>
  )

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Revenue"
          value={`₹${Number(stats?.totalSales || 0).toLocaleString('en-IN')}`}
          icon="💰"
          sub="All time"
        />
        <StatCard
          label="Total Orders"
          value={stats?.totalOrders || 0}
          icon="📦"
          sub="All time"
        />
        <StatCard
          label="Products"
          value={stats?.totalProducts || 0}
          icon="🛍️"
          sub="In catalog"
        />
        <StatCard
          label="Customers"
          value={stats?.totalCustomers || 0}
          icon="👥"
          sub="Registered users"
        />
      </div>

      {/* Sales Chart */}
      <div className="admin-card">
        <div className="card-header">
          <h3>Sales (Last 7 Days)</h3>
          {chartData.length === 0 && <span className="no-data-note">No orders yet</span>}
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Sales']} />
              <Area type="monotone" dataKey="sales" stroke="#1a1a1a" strokeWidth={2} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-chart">
            <p>📊 Sales data will appear once orders are placed</p>
          </div>
        )}
      </div>

      {/* Top Products */}
      <div className="admin-card">
        <div className="card-header"><h3>Top Selling Products</h3></div>
        <div className="top-products-list">
          {stats?.topProducts?.length > 0 ? (
            stats.topProducts.map((p, i) => (
              <div key={p.id} className="top-product-row">
                <span className="rank-badge">#{i + 1}</span>
                {p.image_url && (
                  <img
                    src={p.image_url?.startsWith('http') ? p.image_url : `${API_URL}${p.image_url}`}
                    alt={p.title}
                    className="top-product-img"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}
                <span className="top-product-name">{p.title}</span>
                <span className="top-product-sold">{p.total_sold} sold</span>
                <span className="top-product-rev">₹{Number(p.revenue).toLocaleString('en-IN')}</span>
              </div>
            ))
          ) : (
            <p className="no-data-note">No sales data yet. Products will appear once orders are placed.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard