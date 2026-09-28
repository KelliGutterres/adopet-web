import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimalTable from '@/components/AnimalTable.jsx';
import PhotoDropzone from '@/components/PhotoDropzone.jsx';
import { useAuth } from '@/hooks/useAuth.js';
import { compararAnimais } from '@/services/animaisService.js';
import styles from './SimilarityPage.module.css';

function labelResultados(count) {
  if (count === 1) {
    return '1 animal semelhante';
  }
  return `${count} animais semelhantes`;
}

export default function SimilarityPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const requestIdRef = useRef(0);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  async function runCompare(nextFile) {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError('');
    setCandidatos([]);
    setSearched(false);

    try {
      const lista = await compararAnimais(nextFile);
      if (requestId !== requestIdRef.current) {
        return;
      }
      setCandidatos(lista);
      setSearched(true);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      if (err.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setCandidatos([]);
      setError(err.message || 'Erro na requisição');
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  function handleFile(jpeg) {
    setFile(jpeg);
    runCompare(jpeg);
  }

  function handleReset() {
    requestIdRef.current += 1;
    setFile(null);
    setCandidatos([]);
    setError('');
    setSearched(false);
    setLoading(false);
  }

  function handleRetry() {
    if (file) {
      runCompare(file);
      return;
    }
    handleReset();
  }

  function openAnimal(animal) {
    navigate(`/painel/animais/${animal.idAnimal}/detalhes?status=${animal.status}`);
  }

  const showResults = searched && !loading && !error;

  return (
    <section className={styles.card}>
      <header className={styles.heading}>
        <h1>Comparação de Similaridade</h1>
        <p>Envie uma foto para encontrar animais perdidos ou encontrados parecidos</p>
      </header>

      {searched ? (
        <div className={styles.query}>
          <img className={styles.queryPhoto} src={previewUrl} alt="Foto enviada" />
          <span className={styles.queryLabel}>Foto enviada</span>
          <button className={styles.action} type="button" onClick={handleReset}>
            Nova busca
          </button>
        </div>
      ) : (
        <div className={styles.picker}>
          <PhotoDropzone
            previewUrl={previewUrl}
            disabled={loading}
            busy={loading}
            ariaLabel="Enviar foto para comparar"
            onFile={handleFile}
            onError={setError}
          />
        </div>
      )}

      {loading ? (
        <p className={styles.status} aria-live="polite" aria-busy="true">
          Comparando imagens… Pode levar alguns segundos.
        </p>
      ) : null}

      {error ? (
        <div className={styles.errorBox}>
          <p className={styles.alert} role="alert">
            {error}
          </p>
          <button className={styles.action} type="button" onClick={handleRetry}>
            Tentar novamente
          </button>
        </div>
      ) : null}

      {showResults && candidatos.length === 0 ? (
        <p className={styles.status}>Nenhum animal semelhante encontrado.</p>
      ) : null}

      {showResults && candidatos.length > 0 ? (
        <>
          <p className={styles.count}>{labelResultados(candidatos.length)}</p>
          <AnimalTable variant="similarity" animais={candidatos} onOpen={openAnimal} />
        </>
      ) : null}
    </section>
  );
}
