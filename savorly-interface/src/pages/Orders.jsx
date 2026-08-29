import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ChefHat,
  ChevronDown,
  CircleDot,
  Clock3,
  PackageCheck,
  Truck,
} from "lucide-react";
import api from "../api/axios";
import SiteLayout from "../components/SiteLayout";

const statuses = ["queued", "cooking", "out_for_delivery", "delivered"];
const statusDetails = {
  queued: { label: "Order received", detail: "We have your order and will begin shortly.", icon: Clock3 },
  cooking: { label: "Cooking fresh", detail: "Your meal is being prepared in our kitchen.", icon: ChefHat },
  out_for_delivery: { label: "On the way", detail: "Your freshly prepared meal is out for delivery.", icon: Truck },
  delivered: { label: "Delivered", detail: "Enjoy your home-style meal!", icon: CheckCircle2 },
};

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function OrderCard({ order, history = false, expanded = false, onToggle }) {
  const currentStep = Math.max(0, statuses.indexOf(order.status));
  const status = statusDetails[order.status] || statusDetails.queued;
  const StatusIcon = status.icon;

  return (
    <article className={`order-card order-card-new ${history ? "order-card-history" : ""} ${expanded ? "is-expanded" : ""}`}>
      <button className="order-card-toggle" onClick={onToggle} aria-expanded={expanded}>
      <header className="order-card-header">
        <div className="order-id-block">
          <span className="order-id-label">Order</span>
          <h3>#{order.id}</h3>
          <p>{formatDate(order.created_at)} IST</p>
        </div>
        <div className={`order-status order-status-${order.status}`}>
          <StatusIcon size={16} />
          <span>{status.label}</span>
        </div>
        <span className="history-expand-btn">
          <span>{expanded ? "Hide details" : "View details"}</span>
          <ChevronDown size={16} />
        </span>
      </header>
      </button>

      <div className="order-details">
      {!history && (
        <>
          <div className="order-status-summary">
            <div className="order-status-icon"><StatusIcon size={20} /></div>
            <div>
              <strong>{status.label}</strong>
              <p>{status.detail}</p>
            </div>
          </div>
          <div className="order-progress" aria-label={`Order status: ${status.label}`}>
            {statuses.slice(0, -1).map((step, index) => {
              const StepIcon = statusDetails[step].icon;
              return (
                <div className={`progress-step ${index <= currentStep ? "complete" : ""} ${index === currentStep ? "current" : ""}`} key={step}>
                  <span><StepIcon size={14} /></span>
                  <small>{statusDetails[step].label}</small>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="order-items">
        {order.items.map((item) => (
          <div className="order-item" key={`${order.id}-${item.food_id}`}>
            <span>{item.food_name} <em>× {item.quantity}</em></span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>
      <footer className="order-total">
        <span>{history ? "Paid" : "Order total"}</span>
        <strong>₹{order.total}</strong>
      </footer>
      </div>
    </article>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedHistory, setExpandedHistory] = useState(null);
  const [expandedActive, setExpandedActive] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

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

  const activeOrders = orders.filter((order) => order.status !== "delivered");
  const orderHistory = orders.filter((order) => order.status === "delivered");

  return (
    <SiteLayout>
      <section className="orders-page container">
        <div className="orders-heading">
          <div>
            <div className="eyebrow">Your orders</div>
            <h1>Order tracking</h1>
            <p>See what is cooking now and revisit your previous meals.</p>
          </div>
          <span className="orders-live"><CircleDot size={14} /> Updates every 10 seconds</span>
        </div>

        {loading && <p className="orders-message">Loading your orders...</p>}
        {error && <p className="orders-message error-text">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <PackageCheck size={30} />
            <h2>No orders yet</h2>
            <p>Choose a fresh homemade meal and it will appear here.</p>
            <Link className="btn btn-primary" to="/menu">Browse the menu</Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-sections">
            <section className="orders-section">
              <div className="orders-section-heading">
                <div><h2>Active orders</h2><p>Follow your meal from kitchen to doorstep.</p></div>
                <span className="orders-count">{activeOrders.length}</span>
              </div>
              {activeOrders.length ? (
                <div className="orders-list">{activeOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    expanded={expandedActive === order.id}
                    onToggle={() => setExpandedActive((current) => current === order.id ? null : order.id)}
                  />
                ))}</div>
              ) : (
                <div className="orders-empty orders-empty-compact"><CheckCircle2 size={22} /><p>Nothing is on the way right now.</p></div>
              )}
            </section>

            <section className="orders-section orders-history-section">
              <button className="order-history-bar" onClick={() => setHistoryOpen((open) => !open)} aria-expanded={historyOpen}>
                <div><h2>Order history</h2><p>Your delivered meals, newest first.</p></div>
                <span className="order-history-bar-action"><span className="orders-count orders-count-muted">{orderHistory.length}</span><ChevronDown size={18} /></span>
              </button>
              {historyOpen && orderHistory.length ? (
                <div className="orders-history-list">{orderHistory.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    history
                    expanded={expandedHistory === order.id}
                    onToggle={() => setExpandedHistory((current) => current === order.id ? null : order.id)}
                  />
                ))}</div>
              ) : historyOpen ? (
                <div className="orders-empty orders-empty-compact"><PackageCheck size={22} /><p>Your delivered orders will appear here.</p></div>
              ) : null}
            </section>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
