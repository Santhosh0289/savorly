import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import SiteLayout from "../components/SiteLayout";

const statuses = ["queued", "cooking", "out_for_delivery", "delivered"];
const statusLabels = {
  queued: "Order received",
  cooking: "Cooking fresh",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await api.get("/orders/my");
      setOrders(data);
      setError("");
    } catch {
      setError("We could not load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  return (
    <SiteLayout>
      <section className="orders-page container">
        <div className="orders-heading">
          <div>
            <div className="eyebrow">Your orders</div>
            <h1>Track your meal</h1>
          </div>
          <span className="orders-live">Live updates</span>
        </div>

        {loading && <p className="orders-message">Loading your orders...</p>}
        {error && <p className="orders-message error-text">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <h2>No orders yet</h2>
            <p>Choose a fresh homemade meal and it will appear here.</p>
            <Link className="btn btn-primary" to="/menu">
              Browse the menu
            </Link>
          </div>
        )}

        <div className="orders-list">
          {orders.map((order) => {
            const currentStep = statuses.indexOf(order.status);
            return (
              <article className="order-card" key={order.id}>
                <div className="order-card-header">
                  <div>
                    <h2>Order #{order.id}</h2>
                    <p>{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <strong className={`status-pill status-${order.status}`}>
                    {statusLabels[order.status] ||
                      order.status.replace(/_/g, " ")}
                  </strong>
                </div>

                <div
                  className="order-progress"
                  aria-label={`Order status: ${statusLabels[order.status]}`}
                >
                  {statuses.map((status, index) => (
                    <div
                      className={`progress-step ${index <= currentStep ? "complete" : ""}`}
                      key={status}
                    >
                      <span>{index + 1}</span>
                      <small>{statusLabels[status]}</small>
                    </div>
                  ))}
                </div>

                <div className="order-items">
                  {order.items.map((item) => (
                    <div
                      className="order-item"
                      key={`${order.id}-${item.food_id}`}
                    >
                      <span>
                        {item.food_name} x {item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  Total <strong>₹{order.total}</strong>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}
