import { iniciaisNome, labelEspecie, labelIdade, labelPorte } from '@/services/animalLabels.js';
import styles from './AnimalTable.module.css';

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="M6 7l1 12h10l1-12" />
    </svg>
  );
}

export default function AnimalTable({ animais, onEdit, onDelete }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Animal</th>
            <th>Espécie / Raça</th>
            <th>Idade</th>
            <th>Porte</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {animais.map((animal) => (
            <tr key={animal.idAnimal}>
              <td>
                <div className={styles.animal}>
                  <span className={styles.photo} aria-hidden="true">
                    {iniciaisNome(animal.nome)}
                  </span>
                  <span>
                    <strong>{animal.nome}</strong>
                    <small>ID: #{animal.idAnimal}</small>
                  </span>
                </div>
              </td>
              <td>
                {labelEspecie(animal.especie)}
                {animal.raca?.nome ? ` ${animal.raca.nome}` : ''}
              </td>
              <td>{labelIdade(animal.idade)}</td>
              <td>{labelPorte(animal.porte)}</td>
              <td>
                <div className={styles.actions}>
                  <button type="button" className={styles.edit} onClick={() => onEdit(animal)}>
                    <PencilIcon />
                    Editar
                  </button>
                  <button type="button" className={styles.remove} onClick={() => onDelete(animal)}>
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
