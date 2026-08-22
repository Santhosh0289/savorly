const steps = [
  { num: "01", title: "Pick your tray", text: "Choose today's meal from the menu." },
  { num: "02", title: "We cook it fresh", text: "Cooking starts once your order is confirmed." },
  { num: "03", title: "Packed hot", text: "Sealed compartment by compartment." },
  { num: "04", title: "Delivered on time", text: "Out for delivery within the hour." },
];

export default function HowItWorks() {
  return (
    <section className="how container" id="how">
      <div className="how-head">
        <div className="eyebrow">How it works</div>
        <h2>From our stove to your table.</h2>
      </div>
      <div className="steps">
        {steps.map((s) => (
          <div className="step" key={s.num}>
            <div className="num">{s.num}</div>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}