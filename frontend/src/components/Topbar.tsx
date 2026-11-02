import { VIEW_NAMES } from '../data/demo'
import type { ViewId } from '../types'
import { Icon } from './Icon'

interface TopbarProps {
  /** Aktuell angezeigter Bereich, dessen Name in der Breadcrumb steht. */
  activeView: ViewId
  /** Ob das mobile Menü geöffnet ist. */
  menuOpen: boolean
  /** Wird beim Klick auf den Menü-Button aufgerufen. */
  onToggleMenu: () => void
  /** Öffnet die Suche. */
  onOpenSearch: () => void
  /** Wird beim Klick auf die Glocke aufgerufen. */
  onNotifications: () => void
}

/**
 * Obere Leiste mit Menü-Button (mobil), Breadcrumb, Suche, Benachrichtigungen und Profil.
 * @param props.activeView - Aktiver Bereich.
 * @param props.menuOpen - Zustand des mobilen Menüs.
 * @param props.onToggleMenu - Callback für den Menü-Button.
 * @param props.onOpenSearch - Callback für die Suche.
 * @param props.onNotifications - Callback für die Glocke.
 */
export function Topbar({ activeView, menuOpen, onToggleMenu, onOpenSearch, onNotifications }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="icon-button menu-toggle"
          onClick={onToggleMenu}
          aria-label="Menü öffnen"
          aria-expanded={menuOpen}
          aria-controls="sidebar"
        >
          <Icon name="menu" />
        </button>
        <span className="crumb-muted">Arbeitsplatz</span>
        <span className="crumb-divider" aria-hidden="true">
          /
        </span>
        <strong id="current-page-label">{VIEW_NAMES[activeView]}</strong>
        <span className="demo-badge">DEMO</span>
      </div>
      <div className="topbar-actions">
        <button type="button" className="search-trigger" onClick={onOpenSearch} aria-label="Suche öffnen">
          <Icon name="search" />
          <span>Suche oder Aktion starten</span>
          <kbd aria-hidden="true">⌘ K</kbd>
        </button>
        <button
          type="button"
          className="icon-button bell-button"
          onClick={onNotifications}
          aria-label="Benachrichtigungen anzeigen"
        >
          <Icon name="bell" />
          <span className="notification-dot" aria-hidden="true" />
        </button>
        <div className="topbar-profile" title="Demo-Benutzer" aria-label="Demo-Benutzer">
          EN
        </div>
      </div>
    </header>
  )
}
