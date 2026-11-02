import { TaskRow } from '../components/TaskRow'
import type { Task } from '../types'

interface InboxViewProps {
  /** Alle offenen Vorgänge. */
  openTasks: Task[]
  /** Öffnet den Prüfdialog eines Vorgangs. */
  onOpenTask: (id: string) => void
}

/**
 * Bereich „Zu prüfen“ mit allen offenen Vorgängen und einer Erklärung zur Produktidee.
 * @param props.openTasks - Alle offenen Vorgänge.
 * @param props.onOpenTask - Callback zum Öffnen eines Vorgangs.
 */
export function InboxView({ openTasks, onOpenTask }: InboxViewProps) {
  return (
    <>
      <section className="secondary-intro">
        <div className="section-kicker">DEIN EINGANG · DEMO</div>
        <h1>
          Nur das, was offen ist<span className="headline-dot">.</span>
        </h1>
        <p>Hier siehst du alle Vorgänge, die in dieser Demo noch nicht geprüft wurden.</p>
      </section>
      <div className="secondary-grid">
        <div className="secondary-panel">
          <h2>{openTasks.length} offene Punkte</h2>
          <div className="task-list">
            {openTasks.length > 0 ? (
              openTasks.map((task) => <TaskRow key={task.id} task={task} onOpen={onOpenTask} />)
            ) : (
              <div className="empty-state">
                <strong>Alles erledigt!</strong>
                Keine offenen Demo-Vorgänge.
              </div>
            )}
          </div>
        </div>
        <aside className="secondary-panel note-panel" aria-labelledby="idea-title">
          <div className="section-kicker">DIE PRODUKTIDEE</div>
          <h2 id="idea-title">Ein Problem. Ein klarer nächster Schritt.</h2>
          <p>
            Später zeigt jeder Vorgang die genaue Fehlerursache und die zulässige Korrektur – statt einer
            allgemeinen Fehlermeldung.
          </p>
          <p>Dieses Modul ist momentan ausschließlich ein lokaler Interaktionsprototyp.</p>
        </aside>
      </div>
    </>
  )
}
