import { describe, it, expect } from 'vitest';
import { computeBalances, settle } from './calc';
import type { Group } from '../types';

function buildAsadoGroup(): Group {
  const people = [
    { id: 'pepe', name: 'Pepe' },
    { id: 'juan', name: 'Juan' },
    { id: 'maria', name: 'Maria' },
    { id: 'a1', name: 'Amigo 1' },
    { id: 'a2', name: 'Amigo 2' },
    { id: 'a3', name: 'Amigo 3' },
    { id: 'a4', name: 'Amigo 4' },
    { id: 'a5', name: 'Amigo 5' },
  ];
  const amigos = ['a1', 'a2', 'a3', 'a4', 'a5'];
  return {
    code: 'ASADO1',
    name: 'asado',
    updatedAt: 0,
    people,
    expenses: [
      // Pepe hizo el asado, comió bebidas y chocotorta (no asado).
      { id: 'asado', name: 'Asado', payerId: 'pepe', amount: 10000, consumerIds: ['juan', ...amigos] },
      // Juan compró bebidas, comió asado y bebidas (no chocotorta).
      { id: 'bebidas', name: 'Bebidas', payerId: 'juan', amount: 20000, consumerIds: ['pepe', 'juan', 'maria', ...amigos] },
      // Maria hizo la chocotorta, comió bebidas y chocotorta (no asado).
      { id: 'choco', name: 'Chocotorta', payerId: 'maria', amount: 30000, consumerIds: ['pepe', 'maria', ...amigos] },
    ],
  };
}

describe('computeBalances', () => {
  it('reparte el ejemplo del asado como se espera', () => {
    const balances = computeBalances(buildAsadoGroup());
    const by = (id: string) => balances.find((b) => b.person.id === id)!;

    expect(by('pepe').balance).toBeCloseTo(3214.29, 2);
    expect(by('juan').balance).toBeCloseTo(15833.33, 2);
    expect(by('maria').balance).toBeCloseTo(23214.29, 2);
    for (const a of ['a1', 'a2', 'a3', 'a4', 'a5']) {
      expect(by(a).balance).toBeCloseTo(-8452.38, 2);
    }
  });

  it('el sistema está balanceado (suma de balances ≈ 0)', () => {
    const balances = computeBalances(buildAsadoGroup());
    const sum = balances.reduce((acc, b) => acc + b.balance, 0);
    expect(sum).toBeCloseTo(0, 1);
  });

  it('un gasto sin consumidores no reparte pero sí cuenta como pagado', () => {
    const group: Group = {
      code: 'X', name: 'x', updatedAt: 0,
      people: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
      expenses: [{ id: 'e', name: 'Solo', payerId: 'a', amount: 100, consumerIds: [] }],
    };
    const balances = computeBalances(group);
    expect(balances.find((b) => b.person.id === 'a')!.balance).toBe(100);
    expect(balances.find((b) => b.person.id === 'b')!.balance).toBe(0);
  });
});

describe('settle', () => {
  it('genera transferencias que saldan todos los balances', () => {
    const balances = computeBalances(buildAsadoGroup());
    const transfers = settle(balances);

    // Reconstruir balances aplicando las transferencias: deben quedar en ~0.
    const net = new Map<string, number>();
    for (const b of balances) net.set(b.person.id, b.balance);
    for (const t of transfers) {
      net.set(t.fromId, (net.get(t.fromId) ?? 0) + t.amount);
      net.set(t.toId, (net.get(t.toId) ?? 0) - t.amount);
    }
    for (const v of net.values()) expect(v).toBeCloseTo(0, 1);
  });

  it('nadie recibe transferencias si todos están saldados', () => {
    expect(settle([{ person: { id: 'a', name: 'A' }, paid: 0, consumed: 0, balance: 0 }])).toEqual([]);
  });
});
