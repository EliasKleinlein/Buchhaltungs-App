import { useEffect, useRef } from 'react'
import { PLANNED_VIEWS, VIEW_NAMES } from '../data/demo'
import type { IconName, Task, ViewId } from '../types'
import { Icon } from './Icon'
import { ModalDialog } from './ModalDialog'

/** Ein Treffer der Suche: entweder ein Bereich oder ein offener Vorgang. */
export type SearchResult =
  | { kind: 'view'; id: ViewId; label: string; icon: IconName }
  | { kind: 'task'; id: string; label: string; icon: IconName }

interface SearchDialogProps {
  /** Ob die Suche geöffnet ist. */
  open: boolean
  /** Aktueller Suchtext. */
  query: string
  /** Offene Vorgänge, die durchsucht werden. */
  tasks: Task[]
  /** Wird beim Ändern des Suchtextes aufgerufen. */
  onQueryChange: (query: string) => void
  /** Wird beim Schließen aufgerufen. */
  onClose: () => void
  /** Wird aufgerufen, wenn ein Treffer gewählt wurde. */
  onSelect: (result: SearchResult) => void
}

/**
 * Filtert Bereiche und offene Vorgänge nach dem Suchtext (Groß-/Kleinschreibung egal).
 * @param query - Suchtext.
 * @param tasks - Offene Vorgänge.
 * @returns Die passenden Treffer.
 */
function searchItems(query: string, tasks: Task[]): SearchResult[] {
  const text = query.toLocaleLowerCase('de').trim()

  const views: SearchResult[] = (Object.keys(VIEW_NAMES) as ViewId[])
    .filter((id) => VIEW_NAMES[id].toLocaleLowerCase('de').includes(text))
    .map((id) => ({ kind: 'view', id, label: VIEW_NAMES[id], icon: PLANNED_VIEWS[id]?.icon ?? 'grid' }))

  const taskHits: SearchResult[] = tasks
    .filter((task) => `${task.title} ${task.desc}`.toLocaleLowerCase('de').includes(text))
    .map((task) => ({ kind: 'task', id: task.id, label: task.title, icon: task.icon }))

  return [...views, ...taskHits]
}

/**
 * Suchdialog für Bereiche und offene Vorgänge (öffnen mit Strg/Cmd + K).
 * @param props.open - Ob der Dialog offen ist.
 * @param props.query - Aktueller Suchtext.
 * @param props.tasks - Offene Vorgänge.
 * @param props.onQueryChange - Callback bei Texteingabe.
 * @param props.onClose - Callback beim Schließen.
 * @param props.onSelect - Callback bei Auswahl eines Treffers.
 */
export function SearchDialog({ open, query, tasks, onQueryChange, onClose, onSelect }: SearchDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const results = searchItems(query, tasks)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  return (
    <ModalDialog open={open} onClose={onClose} className="search-modal" labelledBy="search-title">
      <h2 id="search-title" className="visually-hidden">
        Suche
      </h2>
      <div className="search-modal-top">
        <Icon name="search" />
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          placeholder="Seite oder offenen Punkt suchen …"
          autoComplete="off"
          aria-label="Suchen"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <button type="button" onClick={onClose} aria-label="Suche schließen">
          ESC
        </button>
      </div>
      <div className="search-modal-results">
        {results.length === 0 ? (
          <div className="search-empty">Keine passenden Demo-Einträge.</div>
        ) : (
          results.map((result) => (
            <button
              key={`${result.kind}-${result.id}`}
              type="button"
              className="search-result"
              onClick={() => onSelect(result)}
            >
              <Icon name={result.icon} />
              <span className="result-label">{result.label}</span>
              <small>{result.kind === 'task' ? 'Offener Punkt' : 'Bereich'}</small>
            </button>
          ))
        )}
      </div>
    </ModalDialog>
  )
}
