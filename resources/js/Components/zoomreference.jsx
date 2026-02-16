// resources/js/Components/asset/AssetImagesViewer.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
const X = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Play = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const Volume2 = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M11 5 6 9H3v6h3l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 9c1.333 1 1.333 5 0 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 7c2.667 2 2.667 8 0 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const VolumeX = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M11 5 6 9H3v6h3l5 4V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 9l4 4M21 9l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronLeft = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronRight = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* =========================
   Inline helpers (no imports)
   ========================= */

/** Normalize any media path to a real, public URL (Laravel-friendly). */
function normalizeMediaUrl(u) {
  if (!u) return null;
  const s = String(u).trim();

  // absolute URLs
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  // already public storage
  if (s.startsWith("/storage/")) return s;

  // strip leading slash(es)
  const clean = s.replace(/^\/+/, "");

  // common Laravel outputs to normalize
  if (clean.startsWith("public/storage/")) return "/" + clean.replace(/^public\//, "");
  if (clean.startsWith("storage/")) return "/" + clean;            // -> /storage/...
  if (clean.startsWith("assets/")) return "/storage/" + clean;      // -> /storage/assets/...

  // bare filename
  if (/^[\w.-]+\.(png|jpe?g|webp|gif|svg|mp4|mov|webm)$/i.test(clean)) {
    return "/storage/assets/" + clean;
  }

  // last resort: root-relative
  return "/" + clean;
}

/** Parse possible JSON string / array of sub-images into array of strings. */
function parseSubImages(sub) {
  if (!sub) return [];
  if (Array.isArray(sub)) return sub.filter(Boolean);
  if (typeof sub === "string") {
    try {
      const arr = JSON.parse(sub);
      return Array.isArray(arr) ? arr.filter(Boolean) : [];
    } catch {
      return sub.startsWith("/") || sub.startsWith("http") ? [sub] : [];
    }
  }
  return [];
}

/** Hook: read natural image size (for precise zoom mapping). */
function useNaturalSize(src) {
  const [sz, setSz] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.onload = () => setSz({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
  }, [src]);
  return sz;
}

/** Compute drawn image box inside container for object-contain (letterboxing aware). */
function drawnBox(containerW, containerH, naturalW, naturalH) {
  if (!containerW || !containerH || !naturalW || !naturalH) {
    return { dw: 0, dh: 0, offX: 0, offY: 0, scale: 1 };
  }
  const scale = Math.min(containerW / naturalW, containerH / naturalH);
  const dw = naturalW * scale;
  const dh = naturalH * scale;
  const offX = (containerW - dw) / 2;
  const offY = (containerH - dh) / 2;
  return { dw, dh, offX, offY, scale };
}

/* =========================
   Cost helpers
   ========================= */
function pickPrice(a) {
  if (!a) return null;
  if (typeof a.price === "number") return a.price;
  if (a.category && typeof a.category.purchase_cost === "number") return a.category.purchase_cost;
  return null;
}
function pickPoints(a) {
  if (!a) return null;
  if (typeof a.points === "number") return a.points;
  if (a.category && typeof a.category.additional_points === "number")
    return a.category.additional_points;
  return null;
}
const formatPhp = (n) =>
  typeof n === "number" ? `₱${n.toLocaleString("en-PH", { maximumFractionDigits: 0 })}` : null;

/* =========================
   Component
   ========================= */

/**
 * AssetImagesViewer
 *
 * - Image/video carousel (video auto-first if provided)
 * - Fade transitions + keyboard arrows
 * - Hover zoom (desktop, images) with floating zoom preview (portal to right column)
 * - Image lightbox
 * - Thumbnails rail with scroll arrows
 *
 * Props:
 *  - media?: Array<{ type: "image"|"video", src: string }>
 *  - asset?: {
 *      title?: string,
 *      image_url?: string,
 *      cover_image_path?: string,
 *      file_path?: string,
 *      sub_image_path?: string|array,
 *      video_path?: string,
 *      points?: number,
 *      price?: number,
 *      category?: { additional_points?: number, purchase_cost?: number },
 *      owned?: boolean,
 *      is_purchased?: boolean
 *    }
 *  - zoomPortalId?: string   // DOM id where zoom box will be portaled (right context)
 *  - zoomWidth?: number      // default 520
 *  - zoomHeight?: number     // default 520
 *  - title?: string
 *  - className?: string
 *  - initialActiveIndex?: number
 */
export default function AssetImagesViewer({
  media: mediaProp,
  asset,
  zoomPortalId = null,
  zoomWidth = 520,
  zoomHeight = 520,
  title: titleProp = "Asset preview",
  className = "",
  initialActiveIndex = 0,
  showThumbs = true,
  disableZoom = false,
}) {
  // -------- Build media list --------
  const derivedImages = useMemo(() => {
    if (!asset) return [];
    const baseRaw = asset.image_url || asset.cover_image_path || asset.file_path || null;
    const subsRaw = parseSubImages(asset.sub_image_path);
    const base = normalizeMediaUrl(baseRaw);
    const subs = subsRaw.map(normalizeMediaUrl);
    const seen = new Set();
    return [base, ...subs].filter((u) => u && !seen.has(u) && seen.add(u));
  }, [asset]);

  const derivedMedia = useMemo(() => {
    if (!asset) return [];
    const vidSrc = normalizeMediaUrl(asset.video_path);
    const vid = vidSrc ? [{ type: "video", src: vidSrc }] : [];
    const imgItems = derivedImages.map((src) => ({ type: "image", src }));
    return [...vid, ...imgItems];
  }, [asset, derivedImages]);

  const media = useMemo(() => {
    if (Array.isArray(mediaProp) && mediaProp.length) return mediaProp;
    return derivedMedia;
  }, [mediaProp, derivedMedia]);

  const title = asset?.title || titleProp;

  // -------- Purchase state (points will hide if purchased) --------
  const isPurchased = Boolean(asset?.owned) || Boolean(asset?.is_purchased);

  // -------- Price/points badge ABOVE images --------
  const points = pickPoints(asset);
  const price = pickPrice(asset);

  // Badge logic:
  // - If purchased: HIDE points completely; show Price if available.
  // - If not purchased: show Points if available; else Price if available.
  const priceBadge = (() => {
    if (isPurchased) {
      if (typeof price === "number") return { label: "Price", value: formatPhp(price) };
      return null;
    }
    if (typeof points === "number") return { label: "Points Cost", value: `${points.toLocaleString()} pts` };
    if (typeof price === "number") return { label: "Price", value: formatPhp(price) };
    return null;
  })();

  // -------- State & refs --------
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const active = media[activeIndex] || null;

  const hasMultiple = media.length > 1;
  const AUTO_MS = 5000;
  const FADE_MS = 400;

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const thumbsRef = useRef(null);
  const thumbEls = useRef([]);

  // Lightbox (images only)
  const [lightboxSrc, setLightboxSrc] = useState(null);

  // Hover zoom (desktop)
  const VIEW_W = zoomWidth;
  const VIEW_H = zoomHeight;
  const ZOOM_FACTOR = 2.2;

  const isCoarsePointer =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(pointer: coarse)").matches;

  const { w: naturalW, h: naturalH } = useNaturalSize(active?.type === "image" ? active.src : "");
  const [drawn, setDrawn] = useState({ dw: 0, dh: 0, offX: 0, offY: 0 });
  const [lens, setLens] = useState({ w: 0, h: 0, x: 0, y: 0, show: false });
  const [bg, setBg] = useState({ w: 0, h: 0, x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const recalc = () => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      if (naturalW && naturalH) {
        const d = drawnBox(r.width, r.height, naturalW, naturalH);
        setDrawn(d);
        const desiredLensW = Math.min(d.dw, Math.max(80, VIEW_W / ZOOM_FACTOR));
        const desiredLensH = Math.min(d.dh, Math.max(80, VIEW_H / ZOOM_FACTOR));
        setLens((l) => ({ ...l, w: desiredLensW, h: desiredLensH }));
        const ratioX = VIEW_W / desiredLensW;
        const ratioY = VIEW_H / desiredLensH;
        setBg((b) => ({ ...b, w: d.dw * ratioX, h: d.dh * ratioY }));
      }
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    const current = containerRef.current;
    if (current) ro.observe(current);

    const onResize = () => recalc();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [active?.src, naturalW, naturalH, VIEW_W, VIEW_H]);

  const canZoom = !!(!disableZoom && active?.type === "image" && naturalW && !isCoarsePointer);

  const move = (clientX, clientY) => {
    if (!containerRef.current || !canZoom) return;
    const rect = containerRef.current.getBoundingClientRect();

    let x = clientX - rect.left;
    let y = clientY - rect.top;

    x = Math.max(drawn.offX, Math.min(drawn.offX + drawn.dw, x));
    y = Math.max(drawn.offY, Math.min(drawn.offY + drawn.dh, y));

    const halfW = lens.w / 2;
    const halfH = lens.h / 2;
    const cx = Math.max(drawn.offX + halfW, Math.min(drawn.offX + drawn.dw - halfW, x));
    const cy = Math.max(drawn.offY + halfH, Math.min(drawn.offY + drawn.dh - halfH, y));

    setLens((l) => ({ ...l, x: cx - halfW, y: cy - halfH }));

    const ix = cx - drawn.offX;
    const iy = cy - drawn.offY;
    const ratioX = VIEW_W / lens.w;
    const ratioY = VIEW_H / lens.h;
    setBg({
      w: drawn.dw * ratioX,
      h: drawn.dh * ratioY,
      x: -(ix * ratioX - VIEW_W / 2),
      y: -(iy * ratioY - VIEW_H / 2),
    });
  };

  const onEnter = () => {
    if (canZoom) setLens((l) => ({ ...l, show: true }));
    setIsHovering(true);
  };
  const onLeave = () => {
    setLens((l) => ({ ...l, show: false }));
    setIsHovering(false);
  };
  const onMove = (e) => move(e.clientX, e.clientY);

  // Video autoplay + sound toggle (with fallback unmute overlay)
  const [showUnmute, setShowUnmute] = useState(false);
  const [muted, setMuted] = useState(false);

  // Pause video when switching away
  useEffect(() => {
    return () => {
      const v = videoRef.current;
      if (v) v.pause();
    };
  }, [active?.type, active?.src]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || active?.type !== "video") return;

    let cancelled = false;
    const tryAutoplayWithSound = async () => {
      try {
        v.muted = false;
        setMuted(false);
        v.volume = 1;
        v.autoplay = true;
        const p = v.play();
        if (p && typeof p.then === "function") await p;
        if (!cancelled) setShowUnmute(false);
      } catch {
        try {
          v.muted = true;
          setMuted(true);
          v.play().catch(() => {});
        } catch {}
        if (!cancelled) setShowUnmute(true);

        const unlock = () => {
          if (cancelled) return;
          v.muted = false;
          setMuted(false);
          v.volume = 1;
          v.play().catch(() => {});
          setShowUnmute(false);
          window.removeEventListener("pointerdown", unlock);
          window.removeEventListener("keydown", unlock);
        };
        window.addEventListener("pointerdown", unlock, { once: true });
        window.addEventListener("keydown", unlock, { once: true });
      }
    };

    tryAutoplayWithSound();
    return () => {
      cancelled = true;
    };
  }, [active?.type, active?.src]);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.paused) v.play().catch(() => {});
  };

  // Carousel controls, fade + auto
  const [isVisible, setIsVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = (nextIndex) => {
    if (!hasMultiple || isTransitioning || nextIndex === activeIndex) return;
    setIsTransitioning(true);
    setIsVisible(false);
    setTimeout(() => {
      const mod = ((nextIndex % media.length) + media.length) % media.length;
      setActiveIndex(mod);
      setIsVisible(true);
      setTimeout(() => setIsTransitioning(false), FADE_MS);
    }, FADE_MS);
  };

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  // keyboard
  useEffect(() => {
    if (!hasMultiple) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMultiple, media.length, activeIndex, isTransitioning]);

  // autoplay (skip while video is active / hovering / transitioning / lightbox open)
  useEffect(() => {
    if (!hasMultiple || isHovering || lightboxSrc || isTransitioning) return;
    if (active?.type === "video") return;
    const id = setInterval(() => {
      goNext();
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [hasMultiple, isHovering, lightboxSrc, isTransitioning, active?.type, activeIndex]);

  // Ensure active thumb visible
  useEffect(() => {
    const el = thumbEls.current[activeIndex];
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeIndex]);

  const handleVideoEnded = () => {
    if (!hasMultiple) return;
    goNext();
  };

  const scrollThumbs = (dir) => {
    thumbsRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  /* --------------------------
     External Zoom via Portal
     -------------------------- */
  const [portalEl, setPortalEl] = useState(null);
  useEffect(() => {
    if (!zoomPortalId) {
      setPortalEl(null);
      return;
    }
    const immediate = document.getElementById(zoomPortalId) || null;
    if (immediate) {
      setPortalEl(immediate);
      return;
    }
    let attempts = 0;
    const id = setInterval(() => {
      const el = document.getElementById(zoomPortalId);
      attempts++;
      if (el) {
        setPortalEl(el);
        clearInterval(id);
      } else if (attempts > 40) {
        clearInterval(id);
      }
    }, 50);
    return () => clearInterval(id);
  }, [zoomPortalId]);

  // Zoom box — ABSOLUTE + pointer-events none (overlay on right context, not affecting layout)
  const ZoomBox = (
    <div
      className="absolute top-0 right-0 z-50 rounded-xl border border-black/10 bg-white shadow-xl transition-opacity"
      style={{
        width: `${VIEW_W}px`,
        height: `${VIEW_H}px`,
        backgroundImage: `url(${active?.src})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${bg.w}px ${bg.h}px`,
        backgroundPosition: `${bg.x}px ${bg.y}px`,
        pointerEvents: "none",
        opacity: lens.show ? 1 : 0,
      }}
      aria-hidden={!lens.show}
    />
  );

  // compute safe offset for Next button when portal exists (extra room on the right)
  const nextRightPx = portalEl ? 20 : 8;

  return (
    <div className={`flex flex-col items-stretch ${className}`}>
      {/* Cost badge ABOVE images */}
      {priceBadge && (
        <div className="self-start mb-2 bg-yellow-400 text-black font-bold text-base px-3 py-1 rounded border-2 border-yellow-500 shadow">
          {priceBadge.label}: {priceBadge.value}
        </div>
      )}

      {/* Main square viewer */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square bg-neutral-900 rounded overflow-hidden shadow-inner select-none"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onMouseMove={onMove}
      >
        {/* Fade wrapper */}
        <div
          className={`absolute inset-0 transition-opacity duration-[${FADE_MS}ms] ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {active?.type === "video" ? (
            <div className="absolute inset-0">
              <video
                ref={videoRef}
                src={active?.src}
                controls
                autoPlay
                playsInline
                onEnded={handleVideoEnded}
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
              {/* Unmute overlay */}
              {showUnmute && (
                <button
                  type="button"
                  onClick={toggleMute}
                  className="absolute bottom-3 right-3 bg:black/70 bg-black/70 text-white rounded-md px-3 py-1.5 flex items-center gap-2 z-20"
                  title="Play with sound"
                >
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  <span className="text-sm">{muted ? "Unmute" : "Mute"}</span>
                </button>
              )}
            </div>
          ) : (
            <img
              src={active?.src || "/Images/placeholder.png"}
              alt={title || "Asset preview"}
              className={`absolute inset-0 w-full h-full object-contain ${canZoom ? "cursor-zoom-in" : ""}`}
              onClick={() => active?.src && setLightboxSrc(active.src)}
              loading="eager"
              draggable={false}
            />
          )}
        </div>

        {/* Lens overlay (desktop-only zoom) */}
        {canZoom && lens.show && (
          <div
            className="pointer-events-none absolute border border-white/80 bg-white/10 backdrop-blur-[1px] rounded-md shadow-[0_8px_24px_rgba(0,0,0,.45)] z-20"
            style={{
              width: `${lens.w}px`,
              height: `${lens.h}px`,
              left: `${lens.x}px`,
              top: `${lens.y}px`,
              boxShadow: "0 0 0 9999px rgba(0,0,0,.28), 0 8px 24px rgba(0,0,0,.45)",
            }}
          />
        )}

        {/* Carousel arrows + indicators */}
        {hasMultiple && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white/60 z-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={goNext}
              className="absolute top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white/60 z-30"
              style={{ right: `${nextRightPx}px` }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {media.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-4 rounded-full ${i === activeIndex ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* External zoom (RIGHT SIDE via portal) or internal fallback (md+) */}
      {canZoom && (
        <>
          {portalEl
            ? createPortal(ZoomBox, portalEl)
            : (
              <div className="hidden md:block relative self-end mt-2" aria-hidden={!lens.show}>
                {/* fallback absolute overlay near viewer */}
                <div className="relative" style={{ width: VIEW_W, height: 0 }}>
                  <div className="absolute top-0 right-0">{ZoomBox}</div>
                </div>
              </div>
            )
          }
        </>
      )}

      {/* Thumbnails rail */}
      {showThumbs && media.length > 1 && (
        <div className="mt-3 relative">
          {media.length > 6 && (
            <>
              <button
                type="button"
                aria-label="Thumbs left"
                onClick={() => scrollThumbs(-1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Thumbs right"
                onClick={() => scrollThumbs(1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text:white text-white p-2 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div ref={thumbsRef} className="mx-7 flex gap-3 overflow-x-hidden pb-1">
            {media.map((m, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={`${m.type}-${m.src}-${i}`}
                  type="button"
                  ref={(el) => (thumbEls.current[i] = el)}
                  onClick={() => setActiveIndex(i)}
                  className={`relative shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                    isActive ? "border-[#b5946f]" : "border-white/20"
                  } focus:outline-none focus:ring-2 focus:ring-[#b5946f]/60`}
                  title={m.type === "video" ? "Play video" : "View image"}
                >
                  {m.type === "video" ? (
                    <div className="relative w-full h-full bg-black/60 grid place-items-center">
                      <Play className="w-6 h-6 text-white/90" />
                    </div>
                  ) : (
                    <img
                      src={m.src}
                      alt={`thumb-${i}`}
                      className="w-full h-full object-cover hover:brightness-110"
                      draggable={false}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox (images only) */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white/90 hover:text-white"
            onClick={() => setLightboxSrc(null)}
            aria-label="Close"
          >
            <X size={28} />
          </button>
          <img src={lightboxSrc} className="max-h-[90vh] max-w-[90vw] rounded-2xl" />
        </div>
      )}
    </div>
  );
}

/* =========================
   Optional named exports
   ========================= */
export { normalizeMediaUrl, parseSubImages };
