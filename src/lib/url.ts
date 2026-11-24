// Código corto de 6 caracteres, sin ceros/letras ambiguos (0/O, 1/I).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;

export function generateCode(): string {
  let code = '';
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

/** Normaliza un nombre a slug read-friendly: "Asado Futbol!" -> "asado-futbol". */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/** Construye el path read-friendly: "/AX43JE-asado-futbol". */
export function buildPath(code: string, name: string): string {
  const slug = slugify(name);
  return '/' + code + (slug ? '-' + slug : '');
}

/**
 * Extrae el código de 6 caracteres del pathname actual.
 * Acepta "/AX43JE-asado-futbol" o "/AX43JE". Devuelve null si no hay código.
 */
export function parseCodeFromPath(pathname: string): string | null {
  const first = pathname.replace(/^\/+/, '').split('/')[0] ?? '';
  const code = first.slice(0, CODE_LENGTH).toUpperCase();
  const valid = code.length === CODE_LENGTH && [...code].every((c) => ALPHABET.includes(c));
  return valid ? code : null;
}

/** Cambia la URL sin recargar, dejando el path read-friendly. */
export function navigateToGroup(code: string, name: string): void {
  history.pushState(null, '', buildPath(code, name));
}
