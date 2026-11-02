import type { IconName, Task, ViewId } from '../types'

/** Fiktive Beispielvorgänge. Sie existieren nur im Arbeitsspeicher der Sitzung. */
export const DEMO_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Betrag im Tankbeleg prüfen',
    desc: 'Beleg 0018 · Belegsumme braucht deine Bestätigung',
    kind: 'Beleg',
    tone: 'peach',
    icon: 'file',
    detail:
      'Der erkannte Betrag wurde nicht bestätigt. Vergleiche die angezeigte Belegsumme mit dem Originalbeleg, bevor eine echte Buchung entsteht.',
  },
  {
    id: 't2',
    title: 'Zahlung zu Rechnung zuordnen',
    desc: 'RE-2026-014 · Eine Zahlung ist noch nicht zugeordnet',
    kind: 'Zahlung',
    tone: 'violet',
    icon: 'link',
    detail:
      'Eine Beispielzahlung ist noch keiner Rechnung zugeordnet. Die konkrete Zuordnung wäre später nur nach Datenabgleich und deiner Bestätigung möglich.',
  },
  {
    id: 't3',
    title: 'Fehlenden Beleg ergänzen',
    desc: 'Vorgang 0093 · Für die Ausgabe fehlt ein Dokument',
    kind: 'Beleg',
    tone: 'mint',
    icon: 'inbox',
    detail:
      'Zu diesem Demo-Geschäftsvorfall liegt noch kein Dokument vor. Die App soll fehlende Unterlagen gezielt und verständlich benennen.',
  },
  {
    id: 't4',
    title: 'Rechnungsentwurf durchsehen',
    desc: 'RE-2026-015 · Noch nicht freigegeben',
    kind: 'Entwurf',
    tone: 'violet',
    icon: 'file',
    detail:
      'Dieser Rechnungsentwurf dient nur der Design-Demo. Ein tatsächlicher Versand ist nicht implementiert.',
  },
]

/** Anzahl bereits erledigter Vorgänge zu Beginn der Demo. */
export const INITIAL_DONE_COUNT = 2

/** Gesamtzahl der Vorgänge für den Fortschritt (erledigt + offen zu Beginn). */
export const TOTAL_TASK_COUNT = INITIAL_DONE_COUNT + DEMO_TASKS.length

/** Anzeigenamen der Bereiche. */
export const VIEW_NAMES: Record<ViewId, string> = {
  overview: 'Überblick',
  inbox: 'Zu prüfen',
  invoices: 'Rechnungen',
  expenses: 'Belege & Ausgaben',
  reports: 'Auswertungen',
  security: 'Zugänge & Rechte',
  settings: 'Einstellungen',
}

/** Kurzbeschreibungen der noch geplanten Bereiche. */
export const PLANNED_VIEWS: Partial<Record<ViewId, { description: string; icon: IconName }>> = {
  invoices: {
    description: 'Rechnungen erstellen, prüfen und nachverfolgen – in einem späteren Entwicklungsschritt.',
    icon: 'file',
  },
  expenses: {
    description: 'Belege erfassen und Ausgaben verstehen, ohne komplizierte Formulare.',
    icon: 'wallet',
  },
  reports: {
    description: 'Aussagekräftige Zahlen, aber erst dann, wenn sie wirklich gebraucht werden.',
    icon: 'chart',
  },
  security: {
    description:
      'Admin-Zugang, Benutzerrollen und Berechtigungen – später mit echter serverseitiger Durchsetzung.',
    icon: 'shield',
  },
  settings: {
    description: 'Arbeitsplatz, Anzeige und persönliche Einstellungen.',
    icon: 'settings',
  },
}
