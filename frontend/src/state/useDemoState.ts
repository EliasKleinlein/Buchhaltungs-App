import { useCallback, useEffect, useRef, useState } from 'react'
import { DEMO_TASKS, INITIAL_DONE_COUNT } from '../data/demo'
import type { Task, ViewId } from '../types'

/** Anzeigedauer einer Hinweismeldung in Millisekunden. */
const TOAST_DURATION_MS = 3900

/**
 * Hinweismeldung mit automatischem Ausblenden.
 * @returns Aktuelle Nachricht und Funktion zum Anzeigen einer neuen Nachricht.
 */
function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const showToast = useCallback((text: string) => {
    setMessage(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(null), TOAST_DURATION_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return { toastMessage: message, showToast }
}

/**
 * Gesamter UI-Zustand der Demo: Bereich, offene Vorgänge, Dialoge, mobiles Menü und Hinweise.
 * Alle Daten liegen nur im Arbeitsspeicher und gehen beim Neuladen verloren.
 * @returns Zustand und Aktionen für die Komponenten.
 */
export function useDemoState() {
  const [view, setView] = useState<ViewId>('overview')
  const [openTasks, setOpenTasks] = useState<Task[]>(DEMO_TASKS)
  const [doneCount, setDoneCount] = useState(INITIAL_DONE_COUNT)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { toastMessage, showToast } = useToast()

  const activeTask = openTasks.find((task) => task.id === activeTaskId) ?? null

  /** Wechselt den Bereich, schließt das mobile Menü und springt nach oben. */
  const navigate = useCallback((next: ViewId) => {
    setView(next)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const openSearch = useCallback(() => {
    setSearchQuery('')
    setSearchOpen(true)
  }, [])

  /** Entfernt den Vorgang aus der Liste und zählt ihn als erledigt. */
  const markTaskDone = useCallback(
    (id: string) => {
      setOpenTasks((tasks) => tasks.filter((task) => task.id !== id))
      setDoneCount((count) => count + 1)
      setActiveTaskId(null)
      showToast('In der Demo als geprüft markiert – keine echten Daten geändert.')
    },
    [showToast],
  )

  // Tastatur: Strg/Cmd + K öffnet die Suche, Escape schließt das mobile Menü.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (!searchOpen) openSearch()
      }
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [searchOpen, openSearch])

  return {
    view,
    navigate,
    openTasks,
    doneCount,
    activeTask,
    openTask: setActiveTaskId,
    closeTask: () => setActiveTaskId(null),
    markTaskDone,
    menuOpen,
    toggleMenu: () => setMenuOpen((open) => !open),
    closeMenu: () => setMenuOpen(false),
    searchOpen,
    searchQuery,
    setSearchQuery,
    openSearch,
    closeSearch: () => setSearchOpen(false),
    toastMessage,
    showToast,
  }
}
