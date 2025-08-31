import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isClient, safeLocal, safeSession, throttle } from '../../utils/storage';

// Mock storage objects
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

describe('Storage Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset storage mocks
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockSessionStorage.getItem.mockClear();
    mockSessionStorage.setItem.mockClear();
    
    // Stub global window with storage
    vi.stubGlobal('window', {
      localStorage: mockLocalStorage,
      sessionStorage: mockSessionStorage,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('isClient', () => {
    it('should return true when window is defined', () => {
      expect(isClient()).toBe(true);
    });

    it('should return false when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      expect(isClient()).toBe(false);
      global.window = originalWindow;
    });
  });

  describe('safeLocal', () => {
    describe('getJSON', () => {
      it('should return parsed JSON when valid data exists', () => {
        const testData = { name: 'test', value: 42 };
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));

        const result = safeLocal.getJSON('test-key', {});

        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
        expect(result).toEqual(testData);
      });

      it('should return fallback when no data exists', () => {
        mockLocalStorage.getItem.mockReturnValue(null);
        const fallback = { default: true };

        const result = safeLocal.getJSON('test-key', fallback);

        expect(result).toEqual(fallback);
      });

      it('should return fallback when JSON parsing fails', () => {
        mockLocalStorage.getItem.mockReturnValue('invalid-json');
        const fallback = { error: true };

        const result = safeLocal.getJSON('test-key', fallback);

        expect(result).toEqual(fallback);
      });

      it('should return fallback when localStorage throws error', () => {
        mockLocalStorage.getItem.mockImplementation(() => {
          throw new Error('Storage error');
        });
        const fallback = { error: true };

        const result = safeLocal.getJSON('test-key', fallback);

        expect(result).toEqual(fallback);
      });

      it('should return fallback when not on client', () => {
        const originalWindow = global.window;
        // @ts-ignore
        delete global.window;
        const fallback = { server: true };

        const result = safeLocal.getJSON('test-key', fallback);

        expect(result).toEqual(fallback);
        global.window = originalWindow;
      });

      it('should handle null values correctly', () => {
        mockLocalStorage.getItem.mockReturnValue('null');
        const fallback = { fallback: true };

        const result = safeLocal.getJSON('test-key', fallback);

        expect(result).toEqual(fallback);
      });
    });

    describe('setJSON', () => {
      it('should stringify and store data', () => {
        const testData = { name: 'test', value: 42 };

        safeLocal.setJSON('test-key', testData);

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'test-key',
          JSON.stringify(testData)
        );
      });

      it('should handle storage errors gracefully', () => {
        mockLocalStorage.setItem.mockImplementation(() => {
          throw new Error('Storage quota exceeded');
        });
        const testData = { name: 'test' };

        // Should not throw
        expect(() => safeLocal.setJSON('test-key', testData)).not.toThrow();
      });

      it('should not call localStorage when not on client', () => {
        const originalWindow = global.window;
        // @ts-ignore
        delete global.window;
        const testData = { name: 'test' };

        safeLocal.setJSON('test-key', testData);

        // Should not throw and not call localStorage
        expect(() => safeLocal.setJSON('test-key', testData)).not.toThrow();
        global.window = originalWindow;
      });
    });
  });

  describe('safeSession', () => {
    describe('getJSON', () => {
      it('should return parsed JSON when valid data exists', () => {
        const testData = { name: 'test', value: 42 };
        mockSessionStorage.getItem.mockReturnValue(JSON.stringify(testData));

        const result = safeSession.getJSON('test-key', {});

        expect(mockSessionStorage.getItem).toHaveBeenCalledWith('test-key');
        expect(result).toEqual(testData);
      });

      it('should return fallback when no data exists', () => {
        mockSessionStorage.getItem.mockReturnValue(null);
        const fallback = { default: true };

        const result = safeSession.getJSON('test-key', fallback);

        expect(result).toEqual(fallback);
      });

      it('should return fallback when JSON parsing fails', () => {
        mockSessionStorage.getItem.mockReturnValue('invalid-json');
        const fallback = { error: true };

        const result = safeSession.getJSON('test-key', fallback);

        expect(result).toEqual(fallback);
      });

      it('should return fallback when sessionStorage throws error', () => {
        mockSessionStorage.getItem.mockImplementation(() => {
          throw new Error('Storage error');
        });
        const fallback = { error: true };

        const result = safeSession.getJSON('test-key', fallback);

        expect(result).toEqual(fallback);
      });
    });

    describe('setJSON', () => {
      it('should stringify and store data', () => {
        const testData = { name: 'test', value: 42 };

        safeSession.setJSON('test-key', testData);

        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
          'test-key',
          JSON.stringify(testData)
        );
      });

      it('should handle storage errors gracefully', () => {
        mockSessionStorage.setItem.mockImplementation(() => {
          throw new Error('Storage quota exceeded');
        });
        const testData = { name: 'test' };

        // Should not throw
        expect(() => safeSession.setJSON('test-key', testData)).not.toThrow();
      });
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should call function immediately on first call', () => {
      const mockFn = vi.fn();
      const throttled = throttle(mockFn, 100);

      throttled('arg1', 'arg2');

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should throttle subsequent calls', () => {
      const mockFn = vi.fn();
      const throttled = throttle(mockFn, 100);

      throttled('call1');
      throttled('call2');
      throttled('call3');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call1');
    });

    it('should call function again after throttle period', () => {
      const mockFn = vi.fn();
      const throttled = throttle(mockFn, 100);

      throttled('call1');
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttled('call2');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenLastCalledWith('call2');
    });

    it('should use last arguments when throttled', () => {
      const mockFn = vi.fn();
      const throttled = throttle(mockFn, 100);

      throttled('call1');
      throttled('call2');
      throttled('call3');

      vi.advanceTimersByTime(100);
      throttled('call4');

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(1, 'call1');
      expect(mockFn).toHaveBeenNthCalledWith(2, 'call4');
    });

    it('should use default throttle time of 200ms', () => {
      const mockFn = vi.fn();
      const throttled = throttle(mockFn);

      throttled('call1');
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(199);
      throttled('call2');
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1);
      throttled('call3');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple arguments correctly', () => {
      const mockFn = vi.fn();
      const throttled = throttle(mockFn, 100);

      throttled(1, 'two', { three: 3 }, [4, 5]);

      expect(mockFn).toHaveBeenCalledWith(1, 'two', { three: 3 }, [4, 5]);
    });

    it('should work with no arguments', () => {
      const mockFn = vi.fn();
      const throttled = throttle(mockFn, 100);

      throttled();

      expect(mockFn).toHaveBeenCalledWith();
    });
  });
});
