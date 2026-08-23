import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  ListOrdered,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const nav = [
    { to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/foods", icon: UtensilsCrossed, label: "Manage Foods" },
    { to: "/admin/customers", icon: Users, label: "Customers" },
    { to: "/admin/queue", icon: ListOrdered, label: "Order Queue" },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <img src={logo} alt="Savorly" className="logo-img" />
          <span>
            <b>Admin</b>
          </span>
        </div>
        <nav className="admin-nav">
          {nav.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon size={18} /> <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <div className="admin-topbar-title">Business Console</div>
          <div className="admin-profile">
            <button
              className="admin-topbar-user"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-label="Open admin profile menu"
            >
              <div className="admin-avatar">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <div className="admin-user-name">{user?.name}</div>
                <div className="admin-user-role">Administrator</div>
              </div>
            </button>
            {profileOpen && (
              <div className="admin-profile-menu">
                <button
                  className="admin-logout"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  <LogOut size={18} /> <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
