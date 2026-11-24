import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Es un user/org pages site (dividir-gastos.github.io) -> se sirve en la raíz.
export default defineConfig({
  base: '/',
  plugins: [react()],
});
