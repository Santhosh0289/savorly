import { useEffect, useState } from "react";
import api from "../api/axios";
import SiteLayout from "../components/SiteLayout";
import FoodCard from "../components/FoodCard";

export default function Menu() {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    api.get("/foods/").then((res) => setFoods(res.data));
  }, []);

  return (
    <SiteLayout>
      <div className="container" style={{ paddingTop: 120 }}>
        <div className="eyebrow">This week</div>
        <h2>Our Menu</h2>
        <div className="menu-grid">
          {foods.map((f) => <FoodCard key={f.id} food={f} />)}
        </div>
      </div>
    </SiteLayout>
  );
}