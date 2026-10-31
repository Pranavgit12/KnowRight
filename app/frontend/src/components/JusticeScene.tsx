const SKETCHFAB_MODEL_ID = "3f0a0054b1714a8490f37c58dc847a01";
const SKETCHFAB_MODEL_PAGE = `https://sketchfab.com/3d-models/lady-justice-sculpture-${SKETCHFAB_MODEL_ID}`;
const SKETCHFAB_EMBED_URL =
  `https://sketchfab.com/models/${SKETCHFAB_MODEL_ID}/embed` +
  "?autostart=1&autospin=0.15&transparent=1&dnt=1&ui_theme=dark&ui_hint=2";

/** Hosted, interactive Lady Justice model shared by the homepage and assistant heroes. */
export function JusticeScene({ className }: { className: string }) {
  return (
    <div className={`justice-scene ${className}`}>
      <iframe
        className="justice-scene-viewer"
        title="Interactive 3D Lady Justice sculpture by Vertice Studios on Sketchfab"
        src={SKETCHFAB_EMBED_URL}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="autoplay; fullscreen; xr-spatial-tracking; web-share"
        allowFullScreen
      />
      <a
        className="justice-scene-attribution"
        href={SKETCHFAB_MODEL_PAGE}
        target="_blank"
        rel="noopener noreferrer"
      >
        3D model by Vertice Studios | View on Sketchfab
      </a>
    </div>
  );
}
