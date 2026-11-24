import type { Expense, Person } from '../types';
import { money } from '../lib/format';

export function ExpenseCard({
  expense,
  people,
  onToggleConsumer,
  onRemove,
}: {
  expense: Expense;
  people: Person[];
  onToggleConsumer: (personId: string) => void;
  onRemove: () => void;
}) {
  const payer = people.find((p) => p.id === expense.payerId);
  const consumers = expense.consumerIds.length;
  const perHead = consumers > 0 ? expense.amount / consumers : 0;

  return (
    <div className="mb-4 overflow-hidden rounded-ios bg-ios-card shadow-sm">
      <div className="flex items-start gap-3 border-b border-ios-sep px-4 py-3">
        <div className="flex-1">
          <p className="text-base font-semibold text-ios-label">{expense.name}</p>
          <p className="text-sm text-ios-secondary">
            Pagó {payer?.name ?? '—'} · {money(expense.amount)}
            {consumers > 0 && <> · {money(perHead)} c/u</>}
          </p>
        </div>
        <button onClick={onRemove} className="text-ios-red active:opacity-50" aria-label="Eliminar gasto">
          Eliminar
        </button>
      </div>
      <div className="px-4 py-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ios-secondary">
          ¿Quiénes lo consumieron?
        </p>
        <div className="flex flex-wrap gap-2">
          {people.map((p) => {
            const active = expense.consumerIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onToggleConsumer(p.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition active:scale-95 ${
                  active
                    ? 'border-ios-blue bg-ios-blue text-white'
                    : 'border-ios-sep bg-white text-ios-label'
                }`}
              >
                {p.name}
              </button>
            );
          })}
          {people.length === 0 && (
            <span className="text-sm text-ios-secondary">Primero cargá personas.</span>
          )}
        </div>
      </div>
    </div>
  );
}
