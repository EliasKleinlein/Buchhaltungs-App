/** Name eines Icons aus der Icon-Bibliothek in `components/Icon.tsx`. */
export type IconName =
  | 'grid'
  | 'inbox'
  | 'file'
  | 'wallet'
  | 'chart'
  | 'shield'
  | 'settings'
  | 'arrow'
  | 'plus'
  | 'search'
  | 'bell'
  | 'chevron'
  | 'check'
  | 'x'
  | 'menu'
  | 'spark'
  | 'link'

/** Farbton eines Vorgangs-Symbols. */
export type Tone = 'peach' | 'violet' | 'mint'

/** Ein offener Vorgang, den der Nutzer prüfen kann. */
export interface Task {
  id: string
  title: string
  desc: string
  kind: string
  tone: Tone
  icon: IconName
  detail: string
}

/** Alle Bereiche der Anwendung. */
export type ViewId =
  | 'overview'
  | 'inbox'
  | 'invoices'
  | 'expenses'
  | 'reports'
  | 'security'
  | 'settings'
