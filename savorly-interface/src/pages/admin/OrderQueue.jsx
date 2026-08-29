import { useEffect, useState } from "react";
import api from "../../api/axios";

const statuses = ["queued", "cooking", "out_for_delivery", "delivered"];
const istDateTime = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default function OrderQueue() {
  const [orders, setOrders] = useState([]);

  const load = () => api.get("/admin/orders").then((res) => setOrders(res.data));
  useEffect(() => {
    load();
    const interval = setInterval(load, 10000); // auto-refresh queue every 10s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/orders/${id}/status`, { status });
    load();
  };

  const prioritizedOrders = [...orders].sort((a, b) => {
    const aDelivered = a.status === "delivered";
    const bDelivered = b.status === "delivered";
    if (aDelivered !== bDelivered) return aDelivered ? 1 : -1;
    return new Date(a.created_at) - new Date(b.created_at);
  });

  return (
    <div>
      <h2 style={{ marginBottom: 6 }}>Order Queue</h2>
      <p style={{ opacity: 0.6, fontSize: 13, marginBottom: 24 }}>Sorted by time placed — oldest first (FIFO).</p>
      <div className="admin-table-wrap"><table>
        <thead><tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Placed At</th><th>Status</th></tr></thead>
        <tbody>
          {prioritizedOrders.map((o, idx) => (
            <tr key={o.id} className={o.status === "delivered" ? "admin-order-delivered" : ""}>
              <td>{idx + 1}</td>
              <td>{o.customer_name}<br /><span style={{ opacity: 0.5, fontSize: 12 }}>{o.phone}</span></td>
              <td>{o.items.map((i) => `${i.food_name} x${i.quantity}`).join(", ")}</td>
              <td>₹{o.total}</td>
              <td>{istDateTime.format(new Date(o.created_at))} IST</td>
              <td>
                <select className={`status-pill status-${o.status}`} value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  style={{ background: "transparent", border: "1px solid var(--line)" }}>
                  {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
