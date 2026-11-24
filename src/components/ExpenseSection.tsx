import { useState } from 'react';
import type { Expense, Person } from '../types';
import { Section, Row, Button, TextInput } from './ui';
import { ExpenseCard } from './ExpenseCard';

export function ExpenseSection({
  expenses,
  people,
  onAdd,
  onRemove,
  onToggleConsumer,
}: {
  expenses: Expense[];
  people: Person[];
  onAdd: (name: string, payerId: string, amount: number) => void;
  onRemove: (id: string) => void;
  onToggleConsumer: (expenseId: string, personId: string) => void;
}) {
  const [name, setName] = useState('');
  const [payerId, setPayerId] = useState('');
  const [amount, setAmount] = useState('');

  const parsedAmount = Number(amount);
  const canAdd = name.trim() !== '' && payerId !== '' && parsedAmount > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd) return;
    onAdd(name.trim(), payerId, parsedAmount);
    setName('');
    setAmount('');
    setPayerId('');
  }

  return (
    <>
      {expenses.length > 0 && (
        <h2 className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-ios-secondary">Gastos</h2>
      )}
      {expenses.map((e) => (
        <ExpenseCard
          key={e.id}
          expense={e}
          people={people}
          onRemove={() => onRemove(e.id)}
          onToggleConsumer={(personId) => onToggleConsumer(e.id, personId)}
        />
      ))}

      <Section title="Nuevo gasto" footer="Ej: Asado · pagó Pepe · $10000. Después marcá quién lo comió.">
        <Row>
          <TextInput
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder="Qué se gastó (asado, bebidas...)"
            aria-label="Nombre del gasto"
          />
        </Row>
        <Row>
          <span className="w-24 text-base text-ios-label">Pagó</span>
          <select
            value={payerId}
            onChange={(ev) => setPayerId(ev.target.value)}
            className="flex-1 bg-transparent text-right text-base text-ios-label focus:outline-none"
            aria-label="Quién pagó"
          >
            <option value="" disabled>
              Elegir…
            </option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Row>
        <Row>
          <span className="w-24 text-base text-ios-label">Monto</span>
          <TextInput
            value={amount}
            onChange={(ev) => setAmount(ev.target.value)}
            inputMode="decimal"
            type="number"
            min="0"
            step="any"
            placeholder="0"
            aria-label="Monto"
            className="text-right"
          />
        </Row>
        <Row>
          <form onSubmit={submit} className="w-full">
            <Button type="submit" variant="plain" disabled={!canAdd} className="px-0">
              Agregar gasto
            </Button>
          </form>
        </Row>
      </Section>
    </>
  );
}
