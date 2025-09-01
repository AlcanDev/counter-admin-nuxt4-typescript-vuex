import { afterEach, vi } from 'vitest';

// Polyfills mínimos
if (!globalThis.requestAnimationFrame) {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(cb, 0));
}
if (!HTMLElement.prototype.focus) {
  HTMLElement.prototype.focus = function () {};
}

// Limpieza segura (sin petar si falta body)
afterEach(() => {
  const d = globalThis.document as Document | undefined;
  if (d?.body) {
    while (d.body.firstChild) d.body.removeChild(d.body.firstChild);
  }
});
