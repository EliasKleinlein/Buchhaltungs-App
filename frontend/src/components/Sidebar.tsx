import type { ReactNode } from 'react'
import type { IconName, ViewId } from '../types'
import { Icon } from './Icon'

interface NavEntry {
  view: ViewId
  label: string
  icon: IconName
  /** Optionaler Zusatz, z. B. Anzahl offener Punkte. */
  badge?: ReactNode
  /** Kennzeichnet einen Bereich, der noch in Planung ist. */
  planned?: boolean
}

interface SidebarProps {
  /** Aktuell angezeigter Bereich. */
  activeView: ViewId
  /** Anzahl offener Vorgänge für den Zähler neben „Zu prüfen“. */
  openTaskCount: number
  /** Ob das Menü auf mobilen Geräten eingeblendet ist. */
  open: boolean
  /** Wird beim Wechsel eines Bereichs aufgerufen. */
  onNavigate: (view: ViewId) => void
}

/**
 * Seitenleiste mit Marke, Arbeitsplatz-Auswahl und Hauptnavigation.
 * @param props.activeView - Aktiver Bereich.
 * @param props.openTaskCount - Zähler für offene Vorgänge.
 * @param props.open - Sichtbarkeit auf mobilen Geräten.
 * @param props.onNavigate - Callback beim Wechsel des Bereichs.
 */
export function Sidebar({ activeView, openTaskCount, open, onNavigate }: SidebarProps) {
  const mainNav: NavEntry[] = [
    { view: 'overview', label: 'Überblick', icon: 'grid' },
    { view: 'inbox', label: 'Zu prüfen', icon: 'inbox', badge: openTaskCount },
    { view: 'invoices', label: 'Rechnungen', icon: 'file' },
    { view: 'expenses', label: 'Belege & Ausgaben', icon: 'wallet' },
    { view: 'reports', label: 'Auswertungen', icon: 'chart' },
  ]
  const adminNav: NavEntry[] = [
    { view: 'security', label: 'Zugänge & Rechte', icon: 'shield', planned: true },
    { view: 'settings', label: 'Einstellungen', icon: 'settings' },
  ]

  const renderItem = (entry: NavEntry) => {
    const isActive = entry.view === activeView
    return (
      <button
        key={entry.view}
        type="button"
        className={`nav-item${isActive ? ' is-active' : ''}`}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => onNavigate(entry.view)}
      >
        <Icon name={entry.icon} />
        <span>{entry.label}</span>
        {entry.badge !== undefined && <span className="nav-count">{entry.badge}</span>}
        {entry.planned && (
          <span className="soon-dot" title="Geplant">
            <span className="visually-hidden">(geplant)</span>
          </span>
        )}
      </button>
    )
  }

  return (
    <aside className={`sidebar${open ? ' is-open' : ''}`} id="sidebar" aria-label="Hauptnavigation">
      <div className="brand-row">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <div>
          <div className="brand-name">
            nori<span>.</span>
          </div>
          <div className="brand-caption">Buchhaltung. Leichter.</div>
        </div>
      </div>
      <div className="workspace-select">
        <div className="workspace-avatar" aria-hidden="true">
          S
        </div>
        <div className="workspace-copy">
          <strong>Studio Nord</strong>
          <small>Demo-Arbeitsplatz</small>
        </div>
        <Icon name="chevron" />
      </div>
      <div className="sidebar-menu-title">DEIN ARBEITSPLATZ</div>
      <nav className="main-nav" aria-label="Arbeitsbereiche">
        {mainNav.map(renderItem)}
      </nav>
      <div className="sidebar-menu-title sidebar-menu-title-second">VERWALTUNG</div>
      <nav className="main-nav" aria-label="Verwaltung">
        {adminNav.map(renderItem)}
      </nav>
      <div className="sidebar-bottom">
        <div className="support-decoration">
          <span className="support-decoration-circle" aria-hidden="true">
            <Icon name="spark" />
          </span>
          <strong>Einfach anfangen.</strong>
          <p>Keine Fachsprache, keine unnötigen Klicks.</p>
          <span>DESIGNKONZEPT · V1</span>
        </div>
        <div className="sidebar-credit">WORKING TITLE · nori.</div>
      </div>
    </aside>
  )
}
