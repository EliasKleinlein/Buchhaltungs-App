import { Icon } from '../components/Icon'
import { PLANNED_VIEWS, VIEW_NAMES } from '../data/demo'
import type { ViewId } from '../types'

interface PlannedViewProps {
  /** Der geplante Bereich, der angezeigt wird. */
  view: ViewId
  /** Zurück zur Übersicht. */
  onBack: () => void
}

/**
 * Platzhalter für Bereiche, die noch nicht umgesetzt sind. Zeigt bewusst keine erfundenen Funktionen.
 * @param props.view - Der geplante Bereich.
 * @param props.onBack - Callback zurück zum Überblick.
 */
export function PlannedView({ view, onBack }: PlannedViewProps) {
  const planned = PLANNED_VIEWS[view]
  if (!planned) return null

  return (
    <>
      <section className="secondary-intro">
        <div className="section-kicker">PRODUKTKONZEPT · SCHRITT FÜR SCHRITT</div>
        <h1>
          {VIEW_NAMES[view]}
          <span className="headline-dot">.</span>
        </h1>
        <p>{planned.description}</p>
      </section>
      <div className="secondary-grid">
        <div className="secondary-panel">
          <div className="planned-art" aria-hidden="true">
            <Icon name={planned.icon} />
          </div>
          <span className="planned-status">FUNKTION IN PLANUNG</span>
          <h2 style={{ marginTop: 20 }}>Zuerst das Layout, dann die Funktion.</h2>
          <p style={{ color: '#838694', lineHeight: 1.8 }}>
            Dieser Bereich zeigt bewusst noch keine erfundenen Funktionen oder Berechtigungen. Wir setzen jeden
            Workflow später einzeln und überprüfbar um.
          </p>
          <button type="button" className="button button-primary" onClick={onBack}>
            Zurück zum Überblick
            <Icon name="arrow" />
          </button>
        </div>
        <aside className="secondary-panel note-panel" aria-labelledby="rule-title">
          <div className="section-kicker">VERBINDLICHE REGEL</div>
          <h2 id="rule-title">Kein Scheinbetrieb.</h2>
          <p>
            Login, Rollen, Datenbank, Bankabgleich und steuerliche Vorgänge werden erst dann als funktionsfähig
            angezeigt, wenn die dazugehörigen technischen Tests bestanden sind.
          </p>
        </aside>
      </div>
    </>
  )
}
