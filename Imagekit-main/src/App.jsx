import { useRef, useState } from "react";

const slides = [
  {
    title: "Paris 🗼",
    url: "https://ik.imagekit.io/tikz5uqzm/Paris.mp4/ik-master.m3u8?tr=sr-240_360_480_720_1080",
    accent: "#22c55e",
  },
  {
    title: "Bali 🌴",
    url: "https://ik.imagekit.io/4xees0kbv/Bali.mp4?tr=l-text,i-Bali,fs-100,co-black,l-end",
    accent: "#3b82f6",
  },
  {
    title: "Egypt 🐪",
    url: "https://ik.imagekit.io/4xees0kbv/Egypt.mp4?tr=l-text,i-Egypt,fs-100,co-black,l-end",
    accent: "#f97316",
  },
];

export default function App() {
  const [idx, setIdx] = useState(0);

  const dragging = useRef(false);
  const startX = useRef(0);
  const deltaX = useRef(0);

  const go = (n) => {
    const len = slides.length;
    setIdx(((n % len) + len) % len);
  };
  const next = () => go(idx + 1);
  const prev = () => go(idx - 1);

  // swipe support (mobile)
  const onDown = (e) => {
    dragging.current = true;
    startX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    deltaX.current = 0;
  };
  const onMove = (e) => {
    if (!dragging.current) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    deltaX.current = x - startX.current;
  };
  const onUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (deltaX.current > 70) prev();
    else if (deltaX.current < -70) next();
  };

  const active = slides[idx];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.badge}>✈️ Bucket List</div>
          <h1 style={styles.heading}>
            My Travel Bucketlist <span style={{ opacity: 0.9 }}>✨</span>
          </h1>
          <p style={styles.subheading}>
            Slide through my dream destinations like postcards.
          </p>

          <div style={styles.routeRow}>
            <span style={styles.routeDot} />
            <div style={styles.routeLine} />
            <span style={styles.routeDot} />
            <span style={styles.routePlane}>✈️</span>
          </div>
        </div>

        <div style={styles.postcard}>
          <div style={styles.tapeLeft} />
          <div style={styles.tapeRight} />

          {/* arrows ONLY */}
          <button
            type="button"
            onClick={prev}
            style={{ ...styles.arrow, left: "14px", color: active.accent }}
            aria-label="Previous"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={next}
            style={{ ...styles.arrow, right: "14px", color: active.accent }}
            aria-label="Next"
          >
            ›
          </button>

          {/* ✅ STABLE: render ONLY the active video */}
          <div
            style={styles.stage}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={onUp}
            onTouchStart={onDown}
            onTouchMove={onMove}
            onTouchEnd={onUp}
          >
            <div style={styles.single}>
              <video
                key={idx} // forces a clean remount on slide change (prevents freeze)
                src={active.url}
                controls
                playsInline
                preload="metadata"
                style={styles.video}
              />
            </div>
          </div>

          <div style={styles.captionRow}>
            <div
              style={{
                ...styles.caption,
                background: `${active.accent}14`,
                borderColor: `${active.accent}40`,
              }}
            >
              <span style={styles.pin}>📍</span>
              <span style={styles.captionText}>{active.title}</span>
            </div>
          </div>
        </div>

        <div style={styles.tip}>Use the arrows (or swipe on mobile)</div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    overflow: "hidden",
    padding: "56px 16px",
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    background:
      "radial-gradient(900px 520px at 18% 10%, rgba(255, 210, 140, 0.70), rgba(255,255,255,0) 60%)," +
      "radial-gradient(1000px 600px at 85% 18%, rgba(150, 220, 255, 0.75), rgba(255,255,255,0) 58%)," +
      "linear-gradient(180deg, #f7fbff 0%, #ffffff 45%, #f8fafc 100%)",
    color: "#0f172a",
  },
  container: { maxWidth: "1000px", margin: "0 auto" },

  header: { textAlign: "center", marginBottom: "22px" },
  badge: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(15,23,42,0.10)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    fontWeight: 800,
    fontSize: "13px",
  },
  heading: {
    margin: "14px 0 8px",
    fontSize: "46px",
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },
  subheading: { margin: 0, fontSize: "15px", color: "rgba(15,23,42,0.70)" },

  routeRow: {
    position: "relative",
    height: "28px",
    marginTop: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  routeDot: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "rgba(15,23,42,0.25)",
  },
  routeLine: { width: "220px", borderTop: "2px dashed rgba(15,23,42,0.25)" },
  routePlane: {
    position: "absolute",
    top: "2px",
    left: "50%",
    transform: "translateX(70px) rotate(8deg)",
    fontSize: "18px",
    opacity: 0.7,
  },

  postcard: {
    position: "relative",
    borderRadius: "28px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.80))",
    padding: "18px 16px 16px",
    border: "1px solid rgba(15,23,42,0.10)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.10)",
  },
  tapeLeft: {
    position: "absolute",
    top: "-10px",
    left: "26px",
    width: "90px",
    height: "26px",
    transform: "rotate(-6deg)",
    borderRadius: "10px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.55))",
    border: "1px solid rgba(15,23,42,0.08)",
  },
  tapeRight: {
    position: "absolute",
    top: "-10px",
    right: "26px",
    width: "90px",
    height: "26px",
    transform: "rotate(6deg)",
    borderRadius: "10px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.55))",
    border: "1px solid rgba(15,23,42,0.08)",
  },

  stage: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "22px",
    background: "transparent",
    border: "1px solid rgba(15,23,42,0.10)",
    aspectRatio: "16 / 9",
    width: "100%",
  },

  // ✅ single active player container
  single: {
    width: "100%",
    height: "100%",
    display: "grid",
    placeItems: "center",
    padding: "10px",
  },

  video: {
    width: "100%",
    height: "100%",
    borderRadius: "18px",
    objectFit: "cover",
    background: "transparent",
  },

  arrow: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    boxShadow: "none",
    width: "44px",
    height: "44px",
    cursor: "pointer",
    fontSize: "44px",
    fontWeight: 900,
    zIndex: 10,
    lineHeight: "44px",
  },

  captionRow: { display: "flex", justifyContent: "center", marginTop: "14px" },
  caption: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(15,23,42,0.10)",
    fontWeight: 900,
  },
  pin: { fontSize: "16px" },
  captionText: { fontSize: "16px" },

  tip: {
    marginTop: "12px",
    textAlign: "center",
    fontSize: "13px",
    color: "rgba(15,23,42,0.55)",
  },
};
