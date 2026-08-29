import Navbar from "./Navbar";
import Footer from "./Footer";
import AIAssistant from "./AIAssistant";

export default function SiteLayout({ children }) {
  return (
    <div className="site-shell">
      <Navbar />
      <main className="site-main">{children}</main>
      <Footer />
      <AIAssistant />
    </div>
  );
}