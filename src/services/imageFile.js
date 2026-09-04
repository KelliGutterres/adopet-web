export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const JPEG_QUALITY = 0.7;
export const MAX_IMAGE_SIDE = 1920;
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif';

const INVALID_TYPE_MESSAGE = 'tipo de arquivo inválido (use JPEG, PNG ou WebP)';
const TOO_LARGE_MESSAGE = 'imagem deve ter no máximo 8 MB';

function getSize(source) {
  return {
    width: source.width || source.naturalWidth || 0,
    height: source.height || source.naturalHeight || 0,
  };
}

function loadViaImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(INVALID_TYPE_MESSAGE));
    };
    image.src = url;
  });
}

async function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // HEIC ou tipo que o bitmap nativo recusa — tenta <img>
    }
  }
  return loadViaImage(file);
}

function canvasToJpegBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Não foi possível preparar a foto.'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}

export async function fileToJpegFile(file) {
  if (!(file instanceof Blob) || file.size === 0) {
    throw new Error('imagem é obrigatório');
  }

  const bitmap = await loadBitmap(file);
  const { width, height } = getSize(bitmap);
  if (!width || !height) {
    if (typeof bitmap.close === 'function') {
      bitmap.close();
    }
    throw new Error(INVALID_TYPE_MESSAGE);
  }

  let nextWidth = width;
  let nextHeight = height;
  const longest = Math.max(width, height);
  if (longest > MAX_IMAGE_SIDE) {
    const scale = MAX_IMAGE_SIDE / longest;
    nextWidth = Math.max(1, Math.round(width * scale));
    nextHeight = Math.max(1, Math.round(height * scale));
  }

  const canvas = document.createElement('canvas');
  canvas.width = nextWidth;
  canvas.height = nextHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    if (typeof bitmap.close === 'function') {
      bitmap.close();
    }
    throw new Error('Não foi possível preparar a foto.');
  }
  context.drawImage(bitmap, 0, 0, nextWidth, nextHeight);
  if (typeof bitmap.close === 'function') {
    bitmap.close();
  }

  const blob = await canvasToJpegBlob(canvas);
  if (blob.size > MAX_IMAGE_BYTES) {
    throw new Error(TOO_LARGE_MESSAGE);
  }

  return new File([blob], 'foto.jpg', { type: 'image/jpeg' });
}
