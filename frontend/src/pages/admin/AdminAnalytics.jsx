import { useState, useEffect } from 'react'
import api from '../../services/api'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import './adminAnalytics.css'

const PIE_COLORS = ['#1a1a1a', '#555', '#888', '#aaa', '#ccc', '#e0e0e0', '#f0f0f0']

const AdminAnalytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/analytics')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const monthlySalesData = data?.monthlySales?.map(d => ({
    name: d.month,
    sales: parseFloat(d.sales),
    orders: parseInt(d.orders),
  })) || []

  const categoryData = data?.categoryRevenue?.map(d => ({
    name: d.name,
    revenue: parseFloat(d.revenue),
  })) || []

  const topProductsData = data?.topProducts?.map(p => ({
    name: p.title?.slice(0, 18) + (p.title?.length > 18 ? '…' : ''),
    sold: parseInt(p.total_sold),
    revenue: parseFloat(p.revenue),
  })) || []

  if (loading) return (
    <div className="admin-page">
      <div className="admin-page-header"><h1>Analytics</h1></div>
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading analytics data...</div>
    </div>
  )

  const hasData = monthlySalesData.some(d => d.sales > 0)

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Analytics</h1>
        <p>Real-time business insights from your store data.</p>
      </div>

      {!hasData && (
        <div className="analytics-empty-banner">
          📊 Analytics charts will populate once customers place orders. The data below reflects your live database.
        </div>
      )}

      {/* Monthly Sales */}
      <div className="admin-card">
        <div className="card-header">
          <h3>Monthly Revenue (Last 12 Months)</h3>
        </div>
        {monthlySalesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlySalesData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v, n) => [n === 'sales' ? `₹${Number(v).toLocaleString('en-IN')}` : v, n === 'sales' ? 'Revenue' : 'Orders']}
              />
              <Area type="monotone" dataKey="sales" stroke="#1a1a1a" strokeWidth={2.5} fill="url(#revenueGrad)" name="sales" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-chart"><p>No monthly data yet</p></div>
        )}
      </div>

      <div className="analytics-two-col">
        {/* Top Products Bar Chart */}
        <div className="admin-card">
          <div className="card-header"><h3>Top Products by Sales Volume</h3></div>
          {topProductsData.some(d => d.sold > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, 'Units Sold']} />
                <Bar dataKey="sold" fill="#1a1a1a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart"><p>Products appear here after orders are placed</p></div>
          )}
        </div>

        {/* Category Revenue Pie Chart */}
        <div className="admin-card">
          <div className="card-header"><h3>Revenue by Category</h3></div>
          {categoryData.some(d => d.revenue > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="revenue"
                  nameKey="name"
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart"><p>Category breakdown will show after orders are placed</p></div>
          )}
        </div>
      </div>

      {/* Summary Table */}
      <div className="admin-card">
        <div className="card-header"><h3>Category Revenue Summary</h3></div>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Revenue</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {categoryData.map((cat, i) => {
              const totalRev = categoryData.reduce((s, c) => s + c.revenue, 0)
              const share = totalRev > 0 ? ((cat.revenue / totalRev) * 100).toFixed(1) : '0.0'
              return (
                <tr key={i}>
                  <td>
                    <span className="cat-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {cat.name}
                  </td>
                  <td>₹{Number(cat.revenue).toLocaleString('en-IN')}</td>
                  <td>
                    <div className="share-bar-wrap">
                      <div className="share-bar" style={{ width: `${share}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span>{share}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminAnalytics