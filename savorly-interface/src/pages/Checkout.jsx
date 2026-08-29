import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import SiteLayout from "../components/SiteLayout";

export default function Checkout() {
  const { cart, total, updateQty, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ address: "", phone: "", notes: "" });
  const [placed, setPlaced] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (cart.length === 0) return;

    await api.post("/orders/", {
      ...form,
      items: cart.map((i) => ({ food_id: i.id, quantity: i.quantity })),
    });
    clearCart();
    setPlaced(true);
  };

  if (placed) {
    return (
      <SiteLayout>
        <div
          className="container"
          style={{ paddingTop: 160, textAlign: "center" }}
        >
          <h2>Order placed! 🎉</h2>
          <p style={{ opacity: 0.7, marginTop: 10 }}>
            We're cooking it fresh — you'll receive it soon.
          </p>
          <Link
            className="btn btn-primary"
            to="/orders"
            style={{ marginTop: 24 }}
          >
            Track your order
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div
        className="container checkout-layout"
        style={{
          paddingTop: 120,
        }}
      >
        <div>
          <h2>Your Cart</h2>
          {cart.length === 0 && (
            <p style={{ opacity: 0.6, marginTop: 20 }}>
              Cart is empty. Go add something tasty!
            </p>
          )}
          {cart.map((item) => (
            <div
              key={item.id}
              className="checkout-item"
            >
              <div>
                <strong>{item.name}</strong>
                <p style={{ fontSize: 13, opacity: 0.6 }}>
                  ₹{item.price} x {item.quantity}
                </p>
              </div>
              <div className="checkout-item-actions">
                <button
                  className="btn btn-ghost"
                  style={{ padding: "4px 10px" }}
                  onClick={() => updateQty(item.id, item.quantity - 1)}
                >
                  -
                </button>
                {item.quantity}
                <button
                  className="btn btn-ghost"
                  style={{ padding: "4px 10px" }}
                  onClick={() => updateQty(item.id, item.quantity + 1)}
                >
                  +
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: "4px 10px" }}
                  onClick={() => removeFromCart(item.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <h3 style={{ marginTop: 20 }}>Total: ₹{total}</h3>
        </div>

        <form
          className="auth-card"
          onSubmit={handleSubmit}
          style={{ height: "fit-content" }}
        >
          <h2>Delivery Details</h2>
          <div className="field">
            <label>Address</label>
            <textarea
              rows="3"
              required
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Phone</label>
            <input
              required
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Notes (optional)</label>
            <textarea
              rows="2"
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }}>
            {user ? "Place Order" : "Login to Order"}
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}
