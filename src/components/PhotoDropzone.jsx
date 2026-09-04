import { useRef, useState } from 'react';
import { fileToJpegFile, IMAGE_ACCEPT } from '@/services/imageFile.js';
import styles from './PhotoDropzone.module.css';

function CloudIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M7.5 18H17a4.5 4.5 0 0 0 .4-9 6 6 0 0 0-11.6 1.6A3.8 3.8 0 0 0 7.5 18z" />
      <path d="M12 14V8" />
      <path d="M9.5 10.5 12 8l2.5 2.5" />
    </svg>
  );
}

export default function PhotoDropzone({
  previewUrl,
  disabled,
  onFile,
  onRemove,
  onError,
  onPreparing,
  showRemove,
}) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [preparing, setPreparing] = useState(false);

  async function handleFiles(fileList) {
    if (disabled || preparing || !fileList?.length) {
      return;
    }

    if (fileList.length > 1) {
      onError('Envie só uma foto.');
    }

    setPreparing(true);
    onPreparing?.(true);
    try {
      const jpeg = await fileToJpegFile(fileList[0]);
      onFile(jpeg);
    } catch (err) {
      onError(err.message || 'Não foi possível preparar a foto.');
    } finally {
      setPreparing(false);
      onPreparing?.(false);
    }
  }

  function openFilePicker() {
    if (disabled || preparing) {
      return;
    }
    fileInputRef.current?.click();
  }

  function openCamera() {
    if (disabled || preparing) {
      return;
    }
    cameraInputRef.current?.click();
  }

  function handleInputChange(event) {
    const files = event.target.files;
    event.target.value = '';
    handleFiles(files);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFilePicker();
    }
  }

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''} ${previewUrl ? styles.hasPreview : ''}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Enviar foto do animal"
        aria-busy={preparing}
        onClick={openFilePicker}
        onKeyDown={handleKeyDown}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) {
            setDragging(true);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <img className={styles.preview} src={previewUrl} alt="Foto do animal" />
        ) : (
          <div className={styles.placeholder}>
            <CloudIcon />
            <p>
              {preparing
                ? 'Preparando foto…'
                : 'Clique para enviar foto ou arraste e solte aqui'}
            </p>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.secondary}
          type="button"
          disabled={disabled || preparing}
          onClick={(event) => {
            event.stopPropagation();
            openFilePicker();
          }}
          aria-label="Escolher foto do computador"
        >
          Escolher arquivo
        </button>
        <button
          className={styles.secondary}
          type="button"
          disabled={disabled || preparing}
          onClick={(event) => {
            event.stopPropagation();
            openCamera();
          }}
          aria-label="Tirar foto do animal"
        >
          Tirar foto
        </button>
        {showRemove ? (
          <button
            className={styles.remove}
            type="button"
            disabled={disabled || preparing}
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            aria-label="Remover foto do animal"
          >
            Remover foto
          </button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        className={styles.hidden}
        type="file"
        accept={IMAGE_ACCEPT}
        disabled={disabled || preparing}
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleInputChange}
      />
      <input
        ref={cameraInputRef}
        className={styles.hidden}
        type="file"
        accept="image/*"
        capture="environment"
        disabled={disabled || preparing}
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleInputChange}
      />
    </div>
  );
}
