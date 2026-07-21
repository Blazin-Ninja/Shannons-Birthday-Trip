/** Public asset path that respects Vite `base` (needed for GitHub Pages). */
export function publicAsset(path: string): string {
  const base = import.meta.env.BASE_URL
  const cleaned = path.replace(/^\//, '')
  return `${base}${cleaned}`
}
