import { iniciaisNome, labelCidade } from '@/services/animalLabels.js';
import { labelContato } from '@/services/usuarioLabels.js';
import styles from './UsuarioTable.module.css';

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="M6 7l1 12h10l1-12" />
    </svg>
  );
}

export default function UsuarioTable({ usuarios, onDelete }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>E-mail</th>
            <th>Contato</th>
            <th>Cidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.idUsuario}>
              <td>
                <div className={styles.user}>
                  <span className={styles.photo} aria-hidden="true">
                    {iniciaisNome(usuario.nome)}
                  </span>
                  <span>
                    <span className={styles.name}>{usuario.nome}</span>
                    <small>ID: #{usuario.idUsuario}</small>
                  </span>
                </div>
              </td>
              <td>{usuario.email}</td>
              <td>{labelContato(usuario.contato)}</td>
              <td>{labelCidade(usuario.cidade)}</td>
              <td>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => onDelete(usuario)}
                    aria-label={`Excluir ${usuario.nome}`}
                  >
                    <TrashIcon />
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
