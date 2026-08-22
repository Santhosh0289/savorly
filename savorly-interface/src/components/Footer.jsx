import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <img src={logo} alt="Savorly" className="logo-img" />
          <p>Homemade meals, cooked fresh and delivered daily across Chennai.</p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Menu</h4>
            <Link to="/menu">This week</Link>
          </div>
          <div>
            <h4>Company</h4>
            <a href="/#how">How it works</a>
            <a href="/#stats">Our impact</a>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
      <div className="container foot-bottom">
        <span>© 2026 Savorly. All rights reserved.</span>
        <span>Chennai, India</span>
      </div>
    </footer>
  );
}