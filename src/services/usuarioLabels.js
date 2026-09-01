export function usuarioMatchesBusca(usuario, busca) {
  const query = (busca || '').trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = [usuario.nome, usuario.email, usuario.contato]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

export function labelContato(contato) {
  const trimmed = (contato || '').trim();
  return trimmed || '—';
}
