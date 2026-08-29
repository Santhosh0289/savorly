export default function CookingLoader({ label = "Cooking things up..." }) {
  return (
    <div className="cooking-loader cooking-loader-refined" role="status" aria-live="polite">
      <div className="loader-kitchen" aria-hidden="true">
        <span className="loader-warm-glow" />
        <div className="loader-motes"><i /><i /><i /><i /></div>
        <div className="loader-gentle-steam">
          <span /><span /><span />
        </div>
        <div className="loader-saucepan">
          <span className="loader-pan-handle loader-pan-handle-left" />
          <span className="loader-pan-handle loader-pan-handle-right" />
          <div className="loader-pan-rim">
            <div className="loader-broth">
              <i /><i /><i />
            </div>
          </div>
          <div className="loader-pan-body" />
        </div>
      </div>
      <div className="cooking-loader-copy">
        <p>{label}<span className="loader-dots"><i /><i /><i /></span></p>
        <span className="loader-caption">Freshly prepared</span>
      </div>
    </div>
  );
}
