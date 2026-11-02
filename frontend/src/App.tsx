import { useRef, type ChangeEvent } from 'react'
import { SearchDialog, type SearchResult } from './components/SearchDialog'
import { Sidebar } from './components/Sidebar'
import { TaskDialog } from './components/TaskDialog'
import { Toast } from './components/Toast'
import { Topbar } from './components/Topbar'
import { TOTAL_TASK_COUNT } from './data/demo'
import { useDemoState } from './state/useDemoState'
import { InboxView } from './views/InboxView'
import { OverviewView } from './views/OverviewView'
import { PlannedView } from './views/PlannedView'

/**
 * Wurzel der Anwendung: Layout aus Seitenleiste, Topbar und dem aktiven Bereich plus Dialoge.
 * Reiner Frontend-Prototyp ohne Backend, Login oder echte Buchungen.
 */
export default function App() {
  const state = useDemoState()
  const receiptInput = useRef<HTMLInputElement>(null)

  /** Zeigt den Namen der gewählten Datei an; es wird nichts hochgeladen oder gelesen. */
  const onReceiptSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) state.showToast(`„${file.name}“ lokal ausgewählt. Kein Upload oder Belegscan ausgeführt.`)
    event.target.value = ''
  }

  /** Springt zum gewählten Bereich oder öffnet den gewählten Vorgang. */
  const onSearchSelect = (result: SearchResult) => {
    state.closeSearch()
    if (result.kind === 'task') state.openTask(result.id)
    else state.navigate(result.id)
  }

  return (
    <>
      <a className="skip-link" href="#app-main">
        Zum Inhalt springen
      </a>

      <div className="app-shell">
        <div className="mobile-overlay" hidden={!state.menuOpen} onClick={state.closeMenu} />
        <Sidebar
          activeView={state.view}
          openTaskCount={state.openTasks.length}
          open={state.menuOpen}
          onNavigate={state.navigate}
        />

        <div className="main-shell">
          <Topbar
            activeView={state.view}
            menuOpen={state.menuOpen}
            onToggleMenu={state.toggleMenu}
            onOpenSearch={state.openSearch}
            onNotifications={() => state.showToast('Demo: Es liegen keine echten Benachrichtigungen vor.')}
          />
          <main id="app-main" tabIndex={-1}>
            <div className="content-width">
              {state.view === 'overview' && (
                <OverviewView
                  openTasks={state.openTasks}
                  doneCount={state.doneCount}
                  totalCount={TOTAL_TASK_COUNT}
                  onOpenTask={state.openTask}
                  onNavigate={state.navigate}
                  onAddReceipt={() => receiptInput.current?.click()}
                />
              )}
              {state.view === 'inbox' && <InboxView openTasks={state.openTasks} onOpenTask={state.openTask} />}
              {state.view !== 'overview' && state.view !== 'inbox' && (
                <PlannedView view={state.view} onBack={() => state.navigate('overview')} />
              )}
            </div>
          </main>
        </div>
      </div>

      <input
        ref={receiptInput}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.xml"
        hidden
        onChange={onReceiptSelected}
        tabIndex={-1}
      />
      <TaskDialog task={state.activeTask} onClose={state.closeTask} onDone={state.markTaskDone} />
      <SearchDialog
        open={state.searchOpen}
        query={state.searchQuery}
        tasks={state.openTasks}
        onQueryChange={state.setSearchQuery}
        onClose={state.closeSearch}
        onSelect={onSearchSelect}
      />
      <Toast message={state.toastMessage} />
    </>
  )
}
