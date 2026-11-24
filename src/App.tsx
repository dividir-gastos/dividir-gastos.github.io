import { useCallback, useEffect, useRef, useState } from 'react';
import type { Group } from './types';
import { emptyGroup } from './types';
import { loadGroup, saveGroup, usingRemote } from './lib/storage';
import { generateCode, parseCodeFromPath, navigateToGroup, buildPath } from './lib/url';
import { uid } from './lib/format';
import { GroupGate } from './components/GroupGate';
import { PeopleSection } from './components/PeopleSection';
import { ExpenseSection } from './components/ExpenseSection';
import { Settlement } from './components/Settlement';
import { Button } from './components/ui';

export default function App() {
  const [group, setGroup] = useState<Group | null>(null);
  const [status, setStatus] = useState<'gate' | 'loading' | 'ready'>('gate');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carga un grupo por código (desde URL o al unirse).
  const openByCode = useCallback(async (code: string) => {
    setStatus('loading');
    setError(null);
    try {
      const existing = await loadGroup(code);
      const g = existing ?? emptyGroup(code, '');
      setGroup(g);
      setStatus('ready');
      history.replaceState(null, '', buildPath(g.code, g.name));
    } catch {
      setError('No se pudo cargar el grupo. Revisá tu conexión.');
      setStatus('gate');
    }
  }, []);

  // Al montar: si la URL trae código, abrir ese grupo.
  useEffect(() => {
    const code = parseCodeFromPath(location.pathname);
    if (code) void openByCode(code);
  }, [openByCode]);

  // Guardado con debounce ante cada cambio del grupo.
  const scheduleSave = useCallback((g: Group) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveGroup(g).catch(() => setError('No se pudo guardar. Reintentá.'));
    }, 500);
  }, []);

  const mutate = useCallback(
    (updater: (g: Group) => Group) => {
      setGroup((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  async function createGroup(name: string) {
    const g = emptyGroup(generateCode(), name);
    setGroup(g);
    setStatus('ready');
    navigateToGroup(g.code, g.name);
    try {
      await saveGroup(g);
    } catch {
      setError('No se pudo guardar el grupo nuevo.');
    }
  }

  function leaveGroup() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setGroup(null);
    setStatus('gate');
    history.pushState(null, '', '/');
  }

  function share() {
    void navigator.clipboard?.writeText(location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  // --- Mutadores ------------------------------------------------------------
  const addPerson = (name: string) =>
    mutate((g) => ({ ...g, people: [...g.people, { id: uid(), name }] }));

  const removePerson = (id: string) =>
    mutate((g) => ({
      ...g,
      people: g.people.filter((p) => p.id !== id),
      expenses: g.expenses
        .filter((e) => e.payerId !== id)
        .map((e) => ({ ...e, consumerIds: e.consumerIds.filter((c) => c !== id) })),
    }));

  const addExpense = (name: string, payerId: string, amount: number) =>
    mutate((g) => ({
      ...g,
      expenses: [...g.expenses, { id: uid(), name, payerId, amount, consumerIds: [...g.people.map((p) => p.id)] }],
    }));

  const removeExpense = (id: string) =>
    mutate((g) => ({ ...g, expenses: g.expenses.filter((e) => e.id !== id) }));

  const toggleConsumer = (expenseId: string, personId: string) =>
    mutate((g) => ({
      ...g,
      expenses: g.expenses.map((e) =>
        e.id !== expenseId
          ? e
          : {
              ...e,
              consumerIds: e.consumerIds.includes(personId)
                ? e.consumerIds.filter((c) => c !== personId)
                : [...e.consumerIds, personId],
            },
      ),
    }));

  // --- Render ---------------------------------------------------------------
  if (status === 'loading') {
    return (
      <div className="flex min-h-full items-center justify-center text-ios-secondary">Cargando…</div>
    );
  }

  if (status === 'gate' || !group) {
    return (
      <>
        {error && <Banner text={error} />}
        <GroupGate onCreate={createGroup} onJoin={openByCode} />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-16 pt-8 safe-top">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-ios-label">{group.name || 'Grupo'}</h1>
            <p className="mt-0.5 font-mono text-sm tracking-widest text-ios-secondary">{group.code}</p>
          </div>
          <Button variant="plain" onClick={leaveGroup} className="px-0">
            Salir
          </Button>
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={share} className="text-sm">
            {copied ? '¡Link copiado!' : 'Compartir link'}
          </Button>
        </div>
        {!usingRemote && (
          <p className="mt-3 text-xs text-ios-secondary">
            Modo local: los datos se guardan solo en este navegador (sin Upstash configurado).
          </p>
        )}
        {error && <p className="mt-2 text-xs text-ios-red">{error}</p>}
      </header>

      <PeopleSection people={group.people} onAdd={addPerson} onRemove={removePerson} />
      <ExpenseSection
        expenses={group.expenses}
        people={group.people}
        onAdd={addExpense}
        onRemove={removeExpense}
        onToggleConsumer={toggleConsumer}
      />
      <Settlement group={group} />
    </div>
  );
}

function Banner({ text }: { text: string }) {
  return <div className="bg-ios-red px-4 py-2 text-center text-sm text-white">{text}</div>;
}
