import { useState } from 'react';
import type { Person } from '../types';
import { Section, Row, Button, TextInput } from './ui';

export function PeopleSection({
  people,
  onAdd,
  onRemove,
}: {
  people: Person[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}) {
  const [name, setName] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    onAdd(n);
    setName('');
  }

  return (
    <Section title="Personas" footer="Cargá a todos los que participan, paguen o no.">
      {people.map((p) => (
        <Row key={p.id}>
          <span className="flex-1 text-base text-ios-label">{p.name}</span>
          <button onClick={() => onRemove(p.id)} className="text-ios-red active:opacity-50" aria-label={`Eliminar ${p.name}`}>
            Eliminar
          </button>
        </Row>
      ))}
      <Row>
        <form onSubmit={submit} className="flex w-full items-center gap-3">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Agregar persona"
            aria-label="Nombre de la persona"
          />
          <Button type="submit" variant="plain" disabled={!name.trim()}>
            Agregar
          </Button>
        </form>
      </Row>
    </Section>
  );
}
