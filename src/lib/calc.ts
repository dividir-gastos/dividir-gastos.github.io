import type { Group, Person } from '../types';

export type Balance = {
  person: Person;
  /** Total que esta persona pagó (gastos a su nombre). */
  paid: number;
  /** Total que le corresponde pagar según lo que consumió. */
  consumed: number;
  /** paid - consumed. Positivo: le deben. Negativo: debe. */
  balance: number;
};

export type Transfer = {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
};

/** Redondeo a centavos para evitar ruido de punto flotante. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Calcula, por persona, cuánto pagó, cuánto consumió y su balance neto.
 *
 * Cada gasto reparte su monto en partes iguales entre sus consumidores.
 * Si un gasto no tiene consumidores, no se reparte (no afecta a nadie salvo
 * a quien lo pagó, que figura como que puso esa plata).
 */
export function computeBalances(group: Group): Balance[] {
  const consumed = new Map<string, number>();
  const paid = new Map<string, number>();
  for (const p of group.people) {
    consumed.set(p.id, 0);
    paid.set(p.id, 0);
  }

  for (const e of group.expenses) {
    if (paid.has(e.payerId)) {
      paid.set(e.payerId, (paid.get(e.payerId) ?? 0) + e.amount);
    }
    const consumers = e.consumerIds.filter((id) => consumed.has(id));
    if (consumers.length === 0) continue;
    const share = e.amount / consumers.length;
    for (const id of consumers) {
      consumed.set(id, (consumed.get(id) ?? 0) + share);
    }
  }

  return group.people.map((person) => {
    const p = round2(paid.get(person.id) ?? 0);
    const c = round2(consumed.get(person.id) ?? 0);
    return { person, paid: p, consumed: c, balance: round2(p - c) };
  });
}

/**
 * A partir de los balances, calcula las transferencias concretas que saldan
 * todas las deudas usando una cantidad mínima de pagos (greedy: empareja al
 * que más debe con al que más le deben).
 */
export function settle(balances: Balance[]): Transfer[] {
  const debtors = balances
    .filter((b) => b.balance < -0.005)
    .map((b) => ({ id: b.person.id, name: b.person.name, amount: -b.balance }))
    .sort((a, b) => b.amount - a.amount);
  const creditors = balances
    .filter((b) => b.balance > 0.005)
    .map((b) => ({ id: b.person.id, name: b.person.name, amount: b.balance }))
    .sort((a, b) => b.amount - a.amount);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = round2(Math.min(debtor.amount, creditor.amount));
    if (amount > 0) {
      transfers.push({
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amount,
      });
    }
    debtor.amount = round2(debtor.amount - amount);
    creditor.amount = round2(creditor.amount - amount);
    if (debtor.amount <= 0.005) i++;
    if (creditor.amount <= 0.005) j++;
  }
  return transfers;
}
