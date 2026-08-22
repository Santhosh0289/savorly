import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function FoodCard({ food }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <motion.div
      className="food-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
    >
      <div className="food-card-img-wrap">
        <img
          src={food.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"}
          alt={food.name}
        />
        <span className="food-tag">{food.category || "Dish"}</span>
      </div>
      <div className="food-card-body">
        <h3>{food.name}</h3>
        <p>{food.description}</p>
        <div className="food-card-footer">
          <span className="price">₹{food.price}</span>
          {!isAdmin && (
            <button className="add-btn" onClick={() => addToCart(food)}>Add +</button>
          )}
        </div>
      </div>
    </motion.div>
  );
}