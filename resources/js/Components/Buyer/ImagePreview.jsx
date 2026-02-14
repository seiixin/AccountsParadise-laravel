export default function ImagePreview({ src, alt = '' }) {
  if (!src) return null;
  return (
    <div className="landscape-box bg-neutral-800">
      <img src={src} alt={alt} />
    </div>
  );
}
