export function whatsappHref(contato, { nomeAnimal } = {}) {
  const digits = String(contato || '').replace(/\D/g, '');
  let e164;

  if (digits.length === 10 || digits.length === 11) {
    e164 = `55${digits}`;
  } else if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    e164 = digits;
  } else {
    return null;
  }

  const nome = String(nomeAnimal || '').trim() || 'animal';
  const text = encodeURIComponent(
    `Olá! Vi o animal ${nome} no AdoPet e gostaria de saber mais.`
  );
  return `https://wa.me/${e164}?text=${text}`;
}
