type Props = {
  src: string
  alt: string
  variant?: 'avatar' | 'hero'
  native?: boolean
}

export function CartoonFrame({ src, alt, variant = 'avatar', native = false }: Props) {
  return (
    <div
      className={`cartoon-frame cartoon-frame--${variant}${native ? ' cartoon-frame--native' : ''}`}
    >
      <img src={src} alt={alt} className="cartoon-frame-img" loading="lazy" />
      <span className="cartoon-frame-shine" aria-hidden />
    </div>
  )
}
