import type { Group } from '../types';

const URL = import.meta.env.VITE_UPSTASH_REDIS_REST_URL as string | undefined;
const TOKEN = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN as string | undefined;

export const usingRemote = Boolean(URL && TOKEN);

const keyFor = (code: string) => `group:${code}`;

// --- Fallback local (desarrollo sin credenciales) --------------------------

function loadLocal(code: string): Group | null {
  try {
    const raw = localStorage.getItem(keyFor(code));
    return raw ? (JSON.parse(raw) as Group) : null;
  } catch {
    return null;
  }
}

function saveLocal(group: Group): void {
  try {
    localStorage.setItem(keyFor(group.code), JSON.stringify(group));
  } catch {
    /* ignore */
  }
}

// --- Upstash REST ----------------------------------------------------------

async function upstash(path: string, body?: string): Promise<unknown> {
  const res = await fetch(`${URL}/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body,
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const data = (await res.json()) as { result?: unknown };
  return data.result;
}

/** Lee un grupo por su código, o null si no existe. */
export async function loadGroup(code: string): Promise<Group | null> {
  if (!usingRemote) return loadLocal(code);
  const result = await upstash(`get/${encodeURIComponent(keyFor(code))}`);
  if (result == null || typeof result !== 'string') return null;
  try {
    return JSON.parse(result) as Group;
  } catch {
    return null;
  }
}

/** Guarda (crea o reemplaza) un grupo. */
export async function saveGroup(group: Group): Promise<void> {
  const toStore: Group = { ...group, updatedAt: Date.now() };
  if (!usingRemote) {
    saveLocal(toStore);
    return;
  }
  await upstash(`set/${encodeURIComponent(keyFor(group.code))}`, JSON.stringify(toStore));
}
