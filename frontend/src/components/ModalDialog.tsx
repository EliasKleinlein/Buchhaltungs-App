import { useEffect, useRef, type ReactNode } from 'react'

interface ModalDialogProps {
  /** Steuert, ob der Dialog geöffnet ist. */
  open: boolean
  /** Wird aufgerufen, wenn der Dialog geschlossen wird (Escape, Backdrop oder eigener Schließen-Button). */
  onClose: () => void
  /** CSS-Klasse für das `<dialog>`-Element. */
  className?: string
  /** ID des Titels, damit der Dialog einen zugänglichen Namen erhält. */
  labelledBy: string
  /** Inhalt des Dialogs. */
  children: ReactNode
}

/**
 * Hülle für das native `<dialog>`-Element. Öffnet und schließt es synchron zum `open`-Prop.
 * @param props.open - Ob der Dialog offen sein soll.
 * @param props.onClose - Callback beim Schließen.
 * @param props.className - Optionale zusätzliche CSS-Klasse.
 * @param props.labelledBy - ID des beschreibenden Titels.
 * @param props.children - Dialoginhalt.
 */
export function ModalDialog({ open, onClose, className, labelledBy, children }: ModalDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className={`modal ${className ?? ''}`} aria-labelledby={labelledBy} onClose={onClose}>
      {children}
    </dialog>
  )
}
