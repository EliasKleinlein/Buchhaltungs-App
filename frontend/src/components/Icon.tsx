import type { ReactNode } from 'react'
import type { IconName } from '../types'

/** SVG-Inhalte (Pfade, Rechtecke, Kreise) je Icon. Stil kommt aus `global.css`. */
const ICON_SHAPES: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 4h16l2 11v5H2v-5L4 4Z" />
      <path d="M2 15h6l2 3h4l2-3h6" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l5 5v13H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v6h6M8 13h8M8 17h6" />
    </>
  ),
  wallet: (
    <>
      <rect x="2.5" y="6" width="19" height="15" rx="3" />
      <path d="M4 7V5a2 2 0 0 1 2-2h12" />
      <path d="M16 14h5" />
    </>
  ),
  chart: <path d="M4 20h16M7 16v-5M12 16V5M17 16V9" strokeLinecap="round" />,
  shield: (
    <>
      <path d="m12 2 8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  settings: (
    <>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  plus: <path d="M12 4v16M4 12h16" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="m16 16 5 5" />
    </>
  ),
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
  chevron: <path d="m7 10 5 5 5-5" />,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  x: <path d="M5 5 19 19M19 5 5 19" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  spark: <path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2Z" />,
  link: (
    <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1L10 6M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 1 0 7.1 7.1L14 18" />
  ),
}

interface IconProps {
  /** Welches Icon angezeigt wird. */
  name: IconName
  /** Zusätzliche CSS-Klasse, z. B. `right-icon`. */
  className?: string
}

/**
 * Dekoratives Icon. Ist immer `aria-hidden`, Bedeutung kommt vom umgebenden Text oder `aria-label`.
 * @param props.name - Name des Icons aus `ICON_SHAPES`.
 * @param props.className - Optionale zusätzliche CSS-Klasse.
 */
export function Icon({ name, className }: IconProps) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_SHAPES[name]}
    </svg>
  )
}
