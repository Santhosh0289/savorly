import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SiteLayout from "../components/SiteLayout";
import Hero from "../components/Hero";
import TrayReveal from "../components/TrayReveal";
import HowItWorks from "../components/HowItWorks";
import FoodCard from "../components/FoodCard";
import api from "../api/axios";

const stats = [
  { label: "Meals delivered", value: "12,500+" },
  { label: "Happy customers", value: "3,200+" },
  { label: "Avg. delivery time", value: "38 min" },
  { label: "Cities served", value: "1" },
];

export default function Home() {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    api.get("/foods/").then((res) => setFoods(res.data.slice(0, 3)));
  }, []);

  return (
    <SiteLayout>
      <Hero />

      <section className="stats-strip" id="stats">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-block"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </section>

      <TrayReveal />

      <section className="container" style={{ padding: "80px 0" }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="eyebrow">Fan favorites</div>
          <h2>What people order the most</h2>
        </motion.div>
        <div className="menu-grid">
          {foods.map((f) => <FoodCard key={f.id} food={f} />)}
        </div>
      </section>

      <HowItWorks />

      <section className="cta-band">
        <h2>Hungry already?</h2>
        <p>Your next home-cooked meal is a few taps away.</p>
        <Link to="/menu" className="btn btn-primary">Order Now</Link>
      </section>
    </SiteLayout>
  );
}