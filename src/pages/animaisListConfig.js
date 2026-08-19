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

export const FORM_COPY = {
  A: {
    title: 'Cadastrar novo animal para adoção',
    subtitle: 'Preencha as informações do animal para disponibilizá-lo para adoção.',
  },
  E: {
    title: 'Cadastrar novo animal encontrado',
    subtitle: 'Preencha as informações do animal cadastrado como encontrado.',
  },
  P: {
    title: 'Cadastrar novo animal perdido',
    subtitle: 'Preencha as informações do animal cadastrado como perdido.',
  },
};

const STATUS_TO_SITUACAO = {
  A: 'adocao',
  E: 'encontrados',
  P: 'perdidos',
};

export function screenFromSituacao(situacao) {
  return LIST_SCREENS[situacao] || null;
}

export function normalizeStatus(value) {
  const status = String(value || '').trim().toUpperCase();
  return STATUS_TO_SITUACAO[status] ? status : 'A';
}

export function situacaoFromStatus(status) {
  return STATUS_TO_SITUACAO[normalizeStatus(status)];
}

export function pathFromStatus(status) {
  return `/painel/animais/${situacaoFromStatus(status)}`;
}

export function listItemIdFromLocation(pathname, search) {
  if (pathname.includes('/animais/novo') || /\/animais\/\d+\/editar\/?$/.test(pathname)) {
    const status = new URLSearchParams(search).get('status');
    return situacaoFromStatus(status);
  }
  if (pathname.includes('/animais/encontrados')) {
    return 'encontrados';
  }
  if (pathname.includes('/animais/perdidos')) {
    return 'perdidos';
  }
  if (pathname.includes('/animais/adocao')) {
    return 'adocao';
  }
  return null;
}
