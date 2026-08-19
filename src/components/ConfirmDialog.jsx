import { useEffect, useId, useRef } from 'react';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  danger = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const cancelRef = useRef(null);
  const previousFocus = useRef(null);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    previousFocus.current = document.activeElement;
    cancelRef.current?.focus();

    function handleKey(event) {
      if (event.key === 'Escape' && !loading) {
        onCancelRef.current();
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      if (previousFocus.current instanceof HTMLElement) {
        previousFocus.current.focus();
      }
    };
  }, [open, loading]);

  if (!open) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Fechar"
        disabled={loading}
        onClick={loading ? undefined : onCancel}
      />
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h2 id={titleId}>{title}</h2>
        <div className={styles.body}>{children}</div>
        <div className={styles.actions}>
          <button
            ref={cancelRef}
            className={styles.cancel}
            type="button"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={danger ? styles.confirmDanger : styles.confirm}
            type="button"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? 'Excluindo…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
