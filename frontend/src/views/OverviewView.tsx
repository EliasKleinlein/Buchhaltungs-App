import type { CSSProperties } from 'react'
import { TaskRow } from '../components/TaskRow'
import { Icon } from '../components/Icon'
import type { Task, ViewId } from '../types'

/** Anzahl der Vorgänge, die auf dem Überblick gezeigt werden. */
const OVERVIEW_TASK_LIMIT = 3

interface OverviewViewProps {
  /** Offene Vorgänge. */
  openTasks: Task[]
  /** Anzahl erledigter Vorgänge. */
  doneCount: number
  /** Gesamtzahl der Vorgänge. */
  totalCount: number
  /** Öffnet den Prüfdialog eines Vorgangs. */
  onOpenTask: (id: string) => void
  /** Wechselt den Bereich. */
  onNavigate: (view: ViewId) => void
  /** Öffnet die Dateiauswahl für einen Beleg. */
  onAddReceipt: () => void
}

/** Zweistellige Anzeige einer Zahl, z. B. 4 → „04“. */
const twoDigits = (value: number) => String(value).padStart(2, '0')

/**
 * Startseite mit Fokus-Karte, Kennzahlen, den nächsten Schritten und Fortschritt.
 * @param props.openTasks - Offene Vorgänge; es werden die ersten drei gezeigt.
 * @param props.doneCount - Anzahl erledigter Vorgänge.
 * @param props.totalCount - Gesamtzahl der Vorgänge.
 * @param props.onOpenTask - Callback zum Öffnen eines Vorgangs.
 * @param props.onNavigate - Callback zum Wechsel des Bereichs.
 * @param props.onAddReceipt - Callback für die Belegauswahl.
 */
export function OverviewView({
  openTasks,
  doneCount,
  totalCount,
  onOpenTask,
  onNavigate,
  onAddReceipt,
}: OverviewViewProps) {
  const openCount = openTasks.length
  const percentage = Math.round((doneCount / totalCount) * 100)
  const progressStyle = { '--progress': `${percentage}%` } as CSSProperties
  const shownTasks = openTasks.slice(0, OVERVIEW_TASK_LIMIT)

  return (
    <div id="overview-view">
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" aria-hidden="true" /> DEIN RUHIGER ARBEITSPLATZ
          </div>
          <h1>
            Ein klarer Kopf.
            <br />
            <em>Freie Zeit.</em>
          </h1>
          <p>Die Zahlen sind da. Wir zeigen dir zuerst, wo du entscheiden musst.</p>
        </div>
        <div className="intro-actions">
          <button type="button" className="button button-primary" onClick={onAddReceipt}>
            <Icon name="plus" />
            Beleg auswählen
            <Icon name="arrow" className="right-icon" />
          </button>
          <span>Lokale Demo · kein echter Upload</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-main-column">
          <section className="feature-card" aria-labelledby="feature-title">
            <div className="feature-content">
              <div className="feature-label">
                <span className="tiny-pulse" aria-hidden="true" /> HEUTE IM FOKUS
              </div>
              <h2 id="feature-title">
                Weniger suchen.
                <br />
                <span>Mehr erledigen.</span>
              </h2>
              <p>Alle offenen Entscheidungen an einem Ort – ohne dich durch Menüs zu schicken.</p>
              <a className="feature-link" href="#focus-section">
                Deine nächsten Schritte
                <Icon name="arrow" />
              </a>
            </div>
            <div className="feature-art" aria-hidden="true">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="art-satellite art-satellite-a" />
              <div className="art-satellite art-satellite-b" />
              <div className="art-heart">
                <span>{twoDigits(openCount)}</span>
                <small>
                  offene
                  <br />
                  Punkte
                </small>
              </div>
              <span className="art-star star-one">✳</span>
              <span className="art-star star-two">✦</span>
            </div>
          </section>

          <div className="stat-strip" aria-label="Demo-Kennzahlen">
            <div className="stat-item">
              <span>Zur Prüfung</span>
              <strong>{twoDigits(openCount)}</strong>
              <small>
                <span className="stat-dot violet" aria-hidden="true" /> Deine Aufmerksamkeit
              </small>
            </div>
            <div className="stat-item">
              <span>Belege erfasst</span>
              <strong>18</strong>
              <small>
                <span className="stat-dot mint" aria-hidden="true" /> Beispieldaten
              </small>
            </div>
            <div className="stat-item">
              <span>Rechnungsentwürfe</span>
              <strong>03</strong>
              <small>
                <span className="stat-dot orange" aria-hidden="true" /> Noch nicht versendet
              </small>
            </div>
          </div>

          <section className="focus-section" id="focus-section" aria-labelledby="focus-title">
            <div className="section-topline">
              <div>
                <div className="section-kicker">DEINE NÄCHSTEN SCHRITTE</div>
                <h2 id="focus-title">
                  Das braucht dich jetzt<span className="headline-dot">.</span>
                </h2>
              </div>
              <button type="button" className="subtle-action" onClick={() => onNavigate('inbox')}>
                Alle ansehen
                <Icon name="arrow" />
              </button>
            </div>
            <div className="task-list">
              {shownTasks.length > 0 ? (
                shownTasks.map((task) => <TaskRow key={task.id} task={task} onOpen={onOpenTask} />)
              ) : (
                <div className="empty-state">
                  <strong>Alles geprüft.</strong>
                  In dieser Demo gibt es aktuell keine weiteren offenen Punkte.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="dashboard-side-column">
          <section className="progress-card" aria-labelledby="progress-title">
            <div className="mini-card-title">
              <Icon name="spark" />
              <span id="progress-title">DEIN FORTSCHRITT</span>
            </div>
            <div
              className="progress-ring"
              style={progressStyle}
              role="img"
              aria-label={`${doneCount} von ${totalCount} Vorgängen erledigt`}
            >
              <div className="progress-inner" aria-hidden="true">
                <strong>
                  {doneCount}/{totalCount}
                </strong>
                <small>erledigt</small>
              </div>
            </div>
            <h3>
              Schritt für Schritt.
              <br />
              Ganz ohne Chaos.
            </h3>
            <p>Du siehst, was erledigt ist – und was noch deine Entscheidung braucht.</p>
            <div className="progress-bottom">
              <span>Demo-Vorgänge</span>
              <strong>{percentage} %</strong>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${percentage}%` }} />
            </div>
          </section>

          <section className="activity-card" aria-labelledby="activity-title">
            <div className="activity-head">
              <div className="section-kicker">AKTUELLE ÜBERSICHT</div>
              <h3 id="activity-title">Zuletzt passiert</h3>
            </div>
            <div className="timeline">
              <div className="timeline-entry">
                <div className="timeline-icon mint-bg">
                  <Icon name="check" />
                </div>
                <div>
                  <strong>Beleg erfasst</strong>
                  <p>Rechnung von Papier &amp; Form</p>
                  <small>Heute · Demo</small>
                </div>
              </div>
              <div className="timeline-entry">
                <div className="timeline-icon peach-bg">
                  <Icon name="file" />
                </div>
                <div>
                  <strong>Entwurf gespeichert</strong>
                  <p>Rechnung RE-2026-014</p>
                  <small>Gestern · Demo</small>
                </div>
              </div>
            </div>
            <button type="button" className="activity-link" onClick={() => onNavigate('reports')}>
              Zum Verlauf
              <Icon name="arrow" />
            </button>
          </section>
        </div>
      </div>

      <footer className="page-footer">
        <span>nori. ist ein klickbarer Designprototyp. Keine echten Buchungen, keine Datenübertragung.</span>
        <span>Konzept · November 2026</span>
      </footer>
    </div>
  )
}
