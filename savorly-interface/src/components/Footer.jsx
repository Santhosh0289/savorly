import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Footer() {
  const navigate = useNavigate();

  const goToHomeSection = (id) => (event) => {
    event.preventDefault();
    navigate("/");
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

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
            <Link to="/" onClick={goToHomeSection("how")}>How it works</Link>
            <Link to="/" onClick={goToHomeSection("stats")}>Our impact</Link>
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
