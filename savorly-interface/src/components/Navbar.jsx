import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const isAdmin = user?.role === "admin";

  return (
    <nav className="nav">
      <Link to="/" className="logo-link">
        <img src={logo} alt="Savorly" className="logo-img" />
      </Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/menu">Menu</Link>
        <Link to="/#how">How it works</Link>

        {isAdmin ? (
          <Link className="btn btn-primary" to="/admin">Go to Admin Panel</Link>
        ) : (
          <>
            {user ? (
              <button className="btn btn-ghost" onClick={() => { logout(); navigate("/"); }}>Logout</button>
            ) : (
              <Link className="btn btn-ghost" to="/login">Login</Link>
            )}
            <Link className="btn btn-primary" to="/checkout">
              Cart {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}