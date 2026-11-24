export type Person = {
  id: string;
  name: string;
};

export type Expense = {
  id: string;
  name: string;
  payerId: string;
  amount: number;
  consumerIds: string[];
};

export type Group = {
  /** Código corto de 6 caracteres. Identidad del grupo (key en Redis). */
  code: string;
  /** Nombre legible del grupo (ej: "asado futbol"). Cosmético / slug de la URL. */
  name: string;
  people: Person[];
  expenses: Expense[];
  updatedAt: number;
};

export function emptyGroup(code: string, name: string): Group {
  return { code, name, people: [], expenses: [], updatedAt: Date.now() };
}
