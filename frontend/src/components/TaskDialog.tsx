import type { Task } from '../types'
import { Icon } from './Icon'
import { ModalDialog } from './ModalDialog'

interface TaskDialogProps {
  /** Der geöffnete Vorgang oder `null`, wenn kein Dialog offen ist. */
  task: Task | null
  /** Wird beim Schließen aufgerufen. */
  onClose: () => void
  /** Wird aufgerufen, wenn der Nutzer den Vorgang als geprüft markiert. */
  onDone: (id: string) => void
}

/**
 * Dialog zur Prüfung eines einzelnen Vorgangs. Die Änderung gilt nur in der laufenden Demo-Sitzung.
 * @param props.task - Der geöffnete Vorgang oder `null`.
 * @param props.onClose - Callback beim Schließen.
 * @param props.onDone - Callback mit der ID des als geprüft markierten Vorgangs.
 */
export function TaskDialog({ task, onClose, onDone }: TaskDialogProps) {
  return (
    <ModalDialog open={task !== null} onClose={onClose} labelledBy="task-dialog-title">
      {task && (
        <div className="modal-body">
          <button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Dialog schließen">
            <Icon name="x" />
          </button>
          <div className="dialog-eyebrow">VORGANG PRÜFEN · DEMO</div>
          <h2 id="task-dialog-title">{task.title}</h2>
          <p className="dialog-desc">{task.desc}</p>
          <div className="dialog-example">{task.detail}</div>
          <button type="button" className="button button-primary dialog-primary" onClick={() => onDone(task.id)}>
            <Icon name="check" />
            Als geprüft markieren
          </button>
          <p className="dialog-disclaimer">Änderung nur lokal in dieser Demo; kein buchhalterischer Vorgang.</p>
        </div>
      )}
    </ModalDialog>
  )
}
