import type { Task } from '../types'
import { Icon } from './Icon'

interface TaskRowProps {
  /** Der darzustellende Vorgang. */
  task: Task
  /** Wird aufgerufen, wenn der Nutzer den Vorgang prüfen möchte. */
  onOpen: (id: string) => void
}

/**
 * Eine Zeile in der Liste offener Vorgänge mit Symbol, Titel, Beschreibung und Prüfen-Button.
 * @param props.task - Der anzuzeigende Vorgang.
 * @param props.onOpen - Callback mit der ID des Vorgangs.
 */
export function TaskRow({ task, onOpen }: TaskRowProps) {
  return (
    <div className="task-row">
      <div className={`task-symbol ${task.tone}`}>
        <Icon name={task.icon} />
      </div>
      <div className="task-content">
        <div className="task-title-row">
          <strong>{task.title}</strong>
          <span className="task-tag">{task.kind}</span>
        </div>
        <p>{task.desc}</p>
      </div>
      <button
        className="task-action"
        type="button"
        onClick={() => onOpen(task.id)}
        aria-label={`Prüfen: ${task.title}`}
      >
        Prüfen
      </button>
    </div>
  )
}
