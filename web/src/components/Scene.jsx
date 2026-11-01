/** A cinematic scene from /public/img, cropped with object-position so the
 *  subject stays in frame at any aspect ratio. */
export default function Scene({ name, alt, className = '', position = 'center', sizes = '(max-width: 800px) 100vw, 1200px', eager = false }) {
  return (
    <img
      src={`/img/${name}.webp`}
      srcSet={`/img/${name}-800.webp 800w, /img/${name}.webp 1600w`}
      sizes={sizes}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`h-full w-full object-cover ${className}`}
      style={{ objectPosition: position }}
    />
  )
}
