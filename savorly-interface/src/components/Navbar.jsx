import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ChevronDown, LogOut, ShoppingBag } from "lucide-react";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const isAdmin = user?.role === "admin";
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [profileOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileOpen(false);
  };

  const goToTop = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToHowItWorks = (event) => {
    event.preventDefault();
    navigate("/");
    window.setTimeout(() => {
      document.getElementById("how")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <nav className="nav">
      <Link to="/" className="logo-link" onClick={goToTop}>
        <img src={logo} alt="Savorly" className="logo-img" />
      </Link>
      
      <div className="nav-links">
        <Link to="/" onClick={goToTop}>Home</Link>
        <Link to="/menu">Menu</Link>
        <Link to="/" onClick={goToHowItWorks}>How it works</Link>
      </div>

      <div className="nav-actions">
        {!isAdmin && !user && (
          <>
            <Link className="btn btn-ghost" to="/login">Login</Link>
            <Link className="btn btn-primary" to="/checkout">
              Cart {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
          </>
        )}

        {!isAdmin && user && (
          <>
            <Link className="btn btn-primary nav-cart-btn" to="/checkout">
              <ShoppingBag size={18} />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
            
            <div className="profile-dropdown" ref={dropdownRef}>
              <button 
                className="profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
              >
                <div className="profile-avatar">{user.name?.[0]?.toUpperCase() || "U"}</div>
                <ChevronDown size={16} />
              </button>

              {profileOpen && (
                <div className="profile-menu">
                  <div className="profile-menu-header">
                    <span>{user.name}</span>
                  </div>
                  <Link 
                    to="/orders" 
                    className="profile-menu-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <ShoppingBag size={16} />
                    My Orders
                  </Link>
                  <button 
                    className="profile-menu-item logout-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {isAdmin && (
          <Link className="btn btn-primary" to="/admin">
            Admin Panel
          </Link>
        )}
      </div>
    </nav>
  );
}
