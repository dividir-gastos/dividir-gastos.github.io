# Dividir Gastos

SPA sencilla para repartir los gastos de una juntada según **lo que consumió
cada uno** (no todos comen todo, y hay quien paga sin consumir o consume sin
pagar). Al final muestra, por persona, cuánto puso, cuánto consumió y **quién le
tiene que pasar plata a quién**.

Stack: React + Vite + Tailwind. Persistencia en **Upstash Redis** (REST desde el
navegador). Se compila y publica en **GitHub Pages** vía GitHub Actions.

## Cómo funciona el reparto

Cada gasto reparte su monto en partes iguales entre quienes lo consumieron.
El balance de cada persona es `lo que pagó − lo que consumió`; con eso se calcula
el conjunto mínimo de transferencias que salda todas las deudas. Ver
[`src/lib/calc.ts`](src/lib/calc.ts) y sus tests
[`src/lib/calc.test.ts`](src/lib/calc.test.ts).

## Grupos y URLs

Cada grupo tiene un código de 6 caracteres (identidad) y un nombre. La URL es
read-friendly: `https://dividir-gastos.github.io/AX43JE-asado-futbol`. Las rutas
profundas funcionan en GitHub Pages gracias al fallback [`public/404.html`](public/404.html).

## Desarrollo

```bash
npm install
cp .env.example .env.local   # opcional: cargar credenciales de Upstash
npm run dev                  # http://localhost:5173
npm test                     # tests del algoritmo de reparto
npm run build                # typecheck + build de producción
```

Sin credenciales de Upstash, la app funciona en **modo local** (localStorage):
sirve para desarrollar, pero no sincroniza entre dispositivos.

## Puesta en producción (una sola vez)

1. Crear una base **Upstash Redis** (plan free) y copiar su *REST URL* y *REST TOKEN*.
2. En el repo: **Settings → Secrets and variables → Actions** → agregar:
   - `VITE_UPSTASH_REDIS_REST_URL`
   - `VITE_UPSTASH_REDIS_REST_TOKEN`
3. En **Settings → Pages → Source**, elegir **GitHub Actions**.
4. Push a `main`: el workflow [`deploy.yml`](.github/workflows/deploy.yml) corre
   tests, compila e implementa.

> ⚠️ Al ser un sitio estático, el token de Upstash queda embebido en el JS
> publicado y es visible para cualquiera que abra la página. Es adecuado para un
> grupo de conocidos; no uses esa base Redis para datos sensibles.
