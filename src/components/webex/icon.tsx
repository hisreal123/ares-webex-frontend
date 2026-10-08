// Webex's own Momentum icons, inlined so they inherit `currentColor`.
const raw = import.meta.glob('../../assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const icons: Record<string, string> = {}
for (const [path, svg] of Object.entries(raw)) {
  icons[path.split('/').pop()!.replace('.svg', '')] = svg
}

export type IconName = string

export function Icon({ name, size = 20, className = '' }: { name: IconName; size?: number; className?: string }) {
  const svg = (icons[name] ?? '').replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}" fill="currentColor"`)
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
