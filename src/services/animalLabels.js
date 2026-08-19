const ESPECIE_LABELS = {
  CAO: 'Cão',
  GATO: 'Gato',
};

const PORTE_LABELS = {
  P: 'Pequeno',
  M: 'Médio',
  G: 'Grande',
};

export function labelEspecie(especie) {
  if (!especie) {
    return '—';
  }
  return ESPECIE_LABELS[especie] || especie;
}

export function labelPorte(porte) {
  if (!porte) {
    return '—';
  }
  return PORTE_LABELS[porte] || porte;
}

export function labelIdade(idade) {
  if (idade === null || idade === undefined || idade === '') {
    return '—';
  }
  const n = Number(idade);
  if (!Number.isInteger(n) || n < 0) {
    return '—';
  }
  return n === 1 ? '1 ano' : `${n} anos`;
}

export function iniciaisNome(nome) {
  const trimmed = (nome || '').trim();
  if (!trimmed) {
    return '?';
  }
  return trimmed.charAt(0).toUpperCase();
}

export function animalMatchesFilters(animal, { busca, especie, porte } = {}) {
  if (especie && animal.especie !== especie) {
    return false;
  }
  if (porte && animal.porte !== porte) {
    return false;
  }

  const query = (busca || '').trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = [
    animal.nome,
    animal.raca?.nome,
    animal.especie,
    labelEspecie(animal.especie),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}
