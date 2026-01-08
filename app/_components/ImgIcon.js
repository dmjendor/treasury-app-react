export default function ImgIcon({ src, alt = "", className = "" }) {
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={className}
    />
  );
}
