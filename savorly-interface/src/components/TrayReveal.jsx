import { useEffect, useRef, useState } from "react";

const dishes = [
  { name: "Jeera Rice", img: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400" },
  { name: "Pepper Chicken", img: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400" },
  { name: "Kachumber Salad", img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400" },
  { name: "House Chutneys", img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400" },
];

// Compartment layout as percentages of the plate container (mirrors the 4-cell tray in the original SVG)
const cells = [
  { left: "28%", top: "30%", w: "38%", h: "34%" },
  { left: "72%", top: "30%", w: "38%", h: "34%" },
  { left: "28%", top: "70%", w: "38%", h: "34%" },
  { left: "72%", top: "70%", w: "38%", h: "34%" },
];

export default function TrayReveal() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState([false, false, false, false]);

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / total));
      const stage = progress * dishes.length;
      setVisible(dishes.map((_, i) => stage - i > 0.15));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="tray-section" ref={sectionRef}>
      <div className="tray-stage">
        <div className="eyebrow" style={{ textAlign: "center", width: "100%" }}>From our kitchen</div>
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>Every tray, packed compartment by compartment.</h2>
        <div className="tray-visual">
          <div className="plate-ring" />
          {cells.map((cell, i) => (
            <div
              key={i}
              className={`tray-item ${visible[i] ? "visible" : ""}`}
              style={{ left: cell.left, top: cell.top, width: cell.w, height: cell.h }}
            >
              <img src={dishes[i].img} alt={dishes[i].name} />
              <span className="tray-item-label">{dishes[i].name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}