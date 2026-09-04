import { useEffect, useState } from 'react';
import { iniciaisNome } from '@/services/animalLabels.js';
import styles from './AnimalPhoto.module.css';

export default function AnimalPhoto({ src, nome, variant = 'table', alt = '' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = Boolean(src) && !failed;

  return (
    <span className={`${styles.photo} ${styles[variant]}`} aria-hidden={showImage ? undefined : true}>
      {showImage ? (
        <img src={src} alt={alt} onError={() => setFailed(true)} />
      ) : (
        iniciaisNome(nome)
      )}
    </span>
  );
}
