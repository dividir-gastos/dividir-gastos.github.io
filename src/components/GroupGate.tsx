import { useState } from 'react';
import { Section, Row, Button, TextInput } from './ui';
import { CODE_LENGTH } from '../lib/url';

export function GroupGate({
  onCreate,
  onJoin,
}: {
  onCreate: (name: string) => void;
  onJoin: (code: string) => void;
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-1 text-3xl font-bold text-ios-label">Dividir Gastos</h1>
      <p className="mb-8 text-base text-ios-secondary">
        Repartí los gastos de una juntada según lo que consumió cada uno.
      </p>

      <Section title="Nuevo grupo" footer="Se crea un código corto para compartir el link.">
        <Row>
          <form
            className="flex w-full items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) onCreate(name.trim());
            }}
          >
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre (ej: Asado fútbol)"
              aria-label="Nombre del grupo"
            />
            <Button type="submit" variant="plain" disabled={!name.trim()}>
              Crear
            </Button>
          </form>
        </Row>
      </Section>

      <Section title="Unirse a un grupo" footer="Pedí el código de 6 caracteres a quien lo creó.">
        <Row>
          <form
            className="flex w-full items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (cleanCode.length === CODE_LENGTH) onJoin(cleanCode);
            }}
          >
            <TextInput
              value={cleanCode}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código"
              aria-label="Código del grupo"
              className="font-mono tracking-widest"
              autoCapitalize="characters"
            />
            <Button type="submit" variant="plain" disabled={cleanCode.length !== CODE_LENGTH}>
              Entrar
            </Button>
          </form>
        </Row>
      </Section>
    </div>
  );
}
