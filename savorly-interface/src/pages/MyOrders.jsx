import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import SiteLayout from "../components/SiteLayout";
import CookingLoader from "../components/CookingLoader";
import { useAuth } from "../context/AuthContext";

const STAGES = ["queued", "cooking", "out_for_delivery", "delivered"];
const STAGE_LABELS = { queued: "Order Placed", cooking: "Cooking", out_for_delivery: "Out for Delivery", delivered: "Delivered" };

function StatusStepper({ status }) {
  const currentIndex = STAGES.indexOf(status);
  return (
    <div className="stepper">
      {STAGES.map((s, i) => (
        <div key={s} className={`stepper-item ${i <= currentIndex ? "done" : ""} ${i === currentIndex ? "current" : ""}`}>
          <div className="stepper-dot" />
          <span>{STAGE_LABELS[s]}</span>
          {i < STAGES.length - 1 && <div className="stepper-line" />}
        </div>
      ))}
    </div>
  );
}

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/orders/my").then((res) => setOrders(res.data)).finally(() => setLoading(false));

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000); // live-refresh tracking every 8s
    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return (
      <SiteLayout>
        <div className="container" style={{ paddingTop: 140, textAlign: "center" }}>
          <h2>Track your orders</h2>
          <p style={{ opacity: 0.7, margin: "12px 0 24px" }}>Log in to see your order history and live status.</p>
          <Link className="btn btn-primary" to="/login">Login</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container" style={{ paddingTop: 120, minHeight: "60vh" }}>
        <div className="eyebrow">Live tracking</div>
        <h2 style={{ marginBottom: 30 }}>My Orders</h2>

        {loading ? (
          <CookingLoader label="Fetching your order history..." />
        ) : orders.length === 0 ? (
          <div style={{ opacity: 0.6, padding: "40px 0" }}>
            No orders yet. <Link to="/menu" style={{ color: "var(--green)" }}>Browse the menu</Link> to place your first one.
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((o) => (
              <div key={o.id} className="order-card">
                <div className="order-card-top">
                  <div>
                    <strong>Order #{o.id}</strong>
                    <p style={{ fontSize: 13, opacity: 0.6 }}>{new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(new Date(o.created_at))} IST</p>
                  </div>
                  <div className="price">₹{o.total}</div>
                </div>

                <StatusStepper status={o.status} />

                <div className="order-items-list">
                  {o.items.map((i, idx) => (
                    <span key={idx} className="order-item-chip">{i.food_name} × {i.quantity}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
