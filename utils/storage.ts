export const isClient = () => typeof window !== 'undefined';

export const safeLocal = {
  getJSON<T>(k: string, fallback: T): T {
    try {
      return isClient() ? (JSON.parse(localStorage.getItem(k) || 'null') ?? fallback) : fallback;
    } catch {
      return fallback;
    }
  },
  setJSON(k: string, v: unknown) {
    try {
      if (isClient()) localStorage.setItem(k, JSON.stringify(v));
    } catch {
      // Silently handle storage errors
    }
  },
};

export const safeSession = {
  getJSON<T>(k: string, fallback: T): T {
    try {
      return isClient() ? (JSON.parse(sessionStorage.getItem(k) || 'null') ?? fallback) : fallback;
    } catch {
      return fallback;
    }
  },
  setJSON(k: string, v: unknown) {
    try {
      if (isClient()) sessionStorage.setItem(k, JSON.stringify(v));
    } catch {
      // Silently handle storage errors
    }
  },
};

export const throttle = <T extends unknown[]>(fn: (..._args: T) => void, ms = 200) => {
  let t = 0,
    lastArgs: T;
  return (...args: T) => {
    const now = Date.now();
    lastArgs = args;
    if (now - t >= ms) {
      t = now;
      fn(...lastArgs);
    }
  };
};
