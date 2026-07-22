type Props = {
  src: string
  alt: string
  variant?: 'avatar' | 'hero'
}

export function CartoonFrame({ src, alt, variant = 'avatar' }: Props) {
  return (
    <div className={`cartoon-frame cartoon-frame--${variant}`}>
      <img src={src} alt={alt} className="cartoon-frame-img" loading="lazy" />
      <span className="cartoon-frame-shine" aria-hidden />
    </div>
  )
}
