export const LIST_SCREENS = {
  adocao: {
    status: 'A',
    title: 'Animais para Adoção',
    subtitle: 'Gerencie os animais disponíveis para adoção.',
    empty: 'Nenhum animal para adoção cadastrado.',
  },
  encontrados: {
    status: 'E',
    title: 'Animais Encontrados',
    subtitle: 'Consulte os animais cadastrados como encontrados.',
    empty: 'Nenhum animal encontrado cadastrado.',
  },
  perdidos: {
    status: 'P',
    title: 'Animais Perdidos',
    subtitle: 'Consulte os animais cadastrados como perdidos.',
    empty: 'Nenhum animal perdido cadastrado.',
  },
};

export function screenFromSituacao(situacao) {
  return LIST_SCREENS[situacao] || null;
}
