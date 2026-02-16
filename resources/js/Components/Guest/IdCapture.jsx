import { useEffect, useRef, useState } from 'react';

export default function IdCapture({
  open,
  onClose,
  onCapture,
  facingMode = 'environment',
  overlayFrame = true,
  cropToFrame = true,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const start = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setReady(true);
            const vw = Math.min(window.innerWidth * 0.9, 480);
            const vh = vw / 1.58;
            setDims({ w: Math.round(vw), h: Math.round(vh) });
          };
        }
      } catch (e) {
        setReady(false);
      }
    };
    if (open) start();
    return () => {
      const s = streamRef.current;
      s?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [open]);

  const capture = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    const ctx = c.getContext('2d');
    if (cropToFrame) {
      const rw = dims.w;
      const rh = dims.h;
      const sx = Math.max(0, (v.videoWidth - rw) / 2);
      const sy = Math.max(0, (v.videoHeight - rh) / 2);
      c.width = rw;
      c.height = rh;
      ctx.drawImage(v, sx, sy, rw, rh, 0, 0, rw, rh);
    } else {
      const vw = v.videoWidth || 640;
      const vh = v.videoHeight || 480;
      c.width = vw;
      c.height = vh;
      ctx.drawImage(v, 0, 0, vw, vh);
    }
    c.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'buyer-id.jpg', { type: blob.type || 'image/jpeg' });
      onCapture?.(file);
      onClose?.();
    }, 'image/jpeg', 0.92);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100001] bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl glass-soft p-4">
        <div className="relative w-full flex items-center justify-center">
          <video ref={videoRef} playsInline muted className="w-full rounded-lg bg-black" />
          {overlayFrame && (
            <div
              className="absolute border-2 border-yellow-400 rounded-md shadow-inner pointer-events-none"
              style={{ width: `${dims.w}px`, height: `${dims.h}px` }}
            />
          )}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded glass-soft px-4 py-2">Cancel</button>
          <button onClick={capture} disabled={!ready} className="ap-btn-primary ap-pill px-4 py-2 disabled:opacity-50">Capture</button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
