import { Link } from "react-router-dom";

export default function Hero() {
  const scrollToHowItWorks = (event) => {
    event.preventDefault();
    document.getElementById("how")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className="hero">
      <div className="eyebrow">Homemade, delivered daily</div>
      <h1>Real food, cooked <span className="accent">fresh</span>, packed with care.</h1>
      <p>Savorly brings home-style meals from our kitchen to your table — made to order, delivered hot, every single day.</p>
      <div className="btn-row">
        <Link to="/menu" className="btn btn-primary">Explore Menu</Link>
        <Link to="#how" className="btn btn-ghost" onClick={scrollToHowItWorks}>
          How it works
        </Link>
      </div>
    </section>
  );
}
