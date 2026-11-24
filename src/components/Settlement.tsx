import type { Group } from '../types';
import { computeBalances, settle } from '../lib/calc';
import { money } from '../lib/format';
import { Section, Row } from './ui';

export function Settlement({ group }: { group: Group }) {
  const balances = computeBalances(group);
  const transfers = settle(balances);
  const totalGastado = group.expenses.reduce((acc, e) => acc + e.amount, 0);

  if (group.people.length === 0 || group.expenses.length === 0) {
    return (
      <Section title="Resultado">
        <Row>
          <span className="text-base text-ios-secondary">
            Cargá personas y al menos un gasto para ver el reparto.
          </span>
        </Row>
      </Section>
    );
  }

  return (
    <>
      <Section title="Balance por persona" footer={`Total gastado: ${money(totalGastado)}`}>
        {balances.map((b) => {
          const owed = b.balance > 0.005;
          const owes = b.balance < -0.005;
          return (
            <Row key={b.person.id}>
              <div className="flex-1">
                <p className="text-base text-ios-label">{b.person.name}</p>
                <p className="text-xs text-ios-secondary">
                  Puso {money(b.paid)} · consumió {money(b.consumed)}
                </p>
              </div>
              <span
                className={`text-base font-semibold ${
                  owed ? 'text-ios-green' : owes ? 'text-ios-red' : 'text-ios-secondary'
                }`}
              >
                {owed ? `Le deben ${money(b.balance)}` : owes ? `Debe ${money(-b.balance)}` : 'Saldado'}
              </span>
            </Row>
          );
        })}
      </Section>

      <Section title="Quién le pasa a quién" footer="Pagos mínimos para saldar todo.">
        {transfers.length === 0 ? (
          <Row>
            <span className="text-base text-ios-secondary">Nadie debe nada. Todo saldado. 🎉</span>
          </Row>
        ) : (
          transfers.map((t, i) => (
            <Row key={i}>
              <span className="flex-1 text-base text-ios-label">
                <span className="font-medium">{t.fromName}</span>
                <span className="text-ios-secondary"> le pasa a </span>
                <span className="font-medium">{t.toName}</span>
              </span>
              <span className="text-base font-semibold text-ios-blue">{money(t.amount)}</span>
            </Row>
          ))
        )}
      </Section>
    </>
  );
}
