import Navbar from "./Navbar";
import Footer from "./Footer";
import AIAssistant from "./AIAssistant";
import { useCart } from "../context/CartContext";

export default function SiteLayout({ children }) {
  const { cartNotice } = useCart();

  return (
    <div className="site-shell">
      <Navbar />
      <main className="site-main">{children}</main>
      <Footer />
      <AIAssistant />
      {cartNotice && (
        <div className="cart-notice" role="status" aria-live="polite">
          <span className="cart-notice-icon" aria-hidden="true">
            &#10003;
          </span>
          <span>
            <strong>{cartNotice.name}</strong> added to cart
          </span>
        </div>
      )}
    </div>
  );
}
