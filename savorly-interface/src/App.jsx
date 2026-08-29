import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ManageFoods from "./pages/admin/ManageFoods";
import Customers from "./pages/admin/Customers";
import OrderQueue from "./pages/admin/OrderQueue";

export default function App() {
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return;
    const defaultViewport = viewport.getAttribute("content") || "width=device-width, initial-scale=1";
    let resetTimer;

    const resetIosZoom = (event) => {
      if (!event.target.matches("input, textarea, select")) return;

      // Safari keeps its automatic input zoom after focus. Temporarily lock the
      // scale on blur, then restore the normal, user-zoomable viewport.
      window.clearTimeout(resetTimer);
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
      );
      resetTimer = window.setTimeout(() => {
        viewport.setAttribute("content", defaultViewport);
      }, 250);
    };

    document.addEventListener("focusout", resetIosZoom);
    return () => {
      window.clearTimeout(resetTimer);
      document.removeEventListener("focusout", resetIosZoom);
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="foods" element={<ManageFoods />} />
        <Route path="customers" element={<Customers />} />
        <Route path="queue" element={<OrderQueue />} />
      </Route>
    </Routes>
  );
}
