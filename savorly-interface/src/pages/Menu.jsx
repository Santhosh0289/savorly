import { useEffect, useState } from "react";
import api from "../api/axios";
import SiteLayout from "../components/SiteLayout";
import FoodCard from "../components/FoodCard";
import CookingLoader from "../components/CookingLoader";

export default function Menu() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/foods/")
      .then((res) => setFoods(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SiteLayout>
      <div className="container" style={{ paddingTop: 120, minHeight: "60vh" }}>
        <div className="eyebrow">This week</div>
        <h2>Our Menu</h2>
        {loading ? (
          <CookingLoader label="Plating up the menu..." />
        ) : (
          <div className="menu-grid">
            {foods.map((f) => <FoodCard key={f.id} food={f} />)}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}