import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

const COLORS = ["#8fc93a", "#c1732b", "#6ea8ff", "#f6f1e4"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Dashboard</h2>

      <div className="stat-grid">
        <div className="stat-card"><div className="label">Total Revenue</div><div className="value">₹{stats.total_revenue}</div></div>
        <div className="stat-card"><div className="label">Total Orders</div><div className="value">{stats.total_orders}</div></div>
        <div className="stat-card"><div className="label">Total Customers</div><div className="value">{stats.total_customers}</div></div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.revenue_by_day}>
              <CartesianGrid stroke="rgba(246,241,228,0.08)" />
              <XAxis dataKey="date" stroke="#f6f1e4" fontSize={12} />
              <YAxis stroke="#f6f1e4" fontSize={12} />
              <Tooltip contentStyle={{ background: "#171812", border: "1px solid rgba(246,241,228,0.14)" }} />
              <Line type="monotone" dataKey="revenue" stroke="#8fc93a" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Orders by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stats.by_status} dataKey="count" nameKey="status" outerRadius={90} label>
                {stats.by_status.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#171812", border: "1px solid rgba(246,241,228,0.14)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <h3>Top Selling Foods</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats.top_foods}>
            <CartesianGrid stroke="rgba(246,241,228,0.08)" />
            <XAxis dataKey="name" stroke="#f6f1e4" fontSize={12} />
            <YAxis stroke="#f6f1e4" fontSize={12} />
            <Tooltip contentStyle={{ background: "#171812", border: "1px solid rgba(246,241,228,0.14)" }} />
            <Bar dataKey="qty" fill="#c1732b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}