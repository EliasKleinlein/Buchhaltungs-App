interface ToastProps {
  /** Anzuzeigende Nachricht oder `null`, wenn gerade nichts angezeigt wird. */
  message: string | null
}

/**
 * Kurze Hinweismeldung unten rechts. Der äußere Live-Bereich bleibt immer im DOM,
 * damit Screenreader neue Meldungen zuverlässig ankündigen.
 * @param props.message - Nachricht oder `null`.
 */
export function Toast({ message }: ToastProps) {
  return (
    <div role="status" aria-live="polite">
      <div className="toast" hidden={message === null}>
        {message}
      </div>
    </div>
  )
}
