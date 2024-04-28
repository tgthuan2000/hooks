import { useCallback, useEffect, useRef } from 'react';

const usePDF = <T extends Record<string, unknown>>(
  cb: (params: T) => {
    commit: () => Promise<unknown>;
    resolved?: () => void;
    error?: (err: unknown) => void;
  },
  ms: number = 1000
) => {
  const resolves = useRef<Array<(value: void | PromiseLike<void>) => void>>([]);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const callback = useRef(cb);

  useEffect(() => {
    callback.current = cb;
  }, [cb]);

  const debounce = useCallback(
    (params: T) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }

      const promise = new Promise<void>((resolve) => {
        resolves.current.push(resolve);
      });

      const { commit, resolved, error } = callback.current(params);

      timeout.current = setTimeout(async () => {
        try {
          await commit();
          resolved?.();
          resolves.current.forEach((resolve) => resolve());
          resolves.current = [];
          timeout.current = null;
        } catch (err) {
          error?.(err);
        }
      }, ms);

      return promise;
    },
    [ms]
  );

  return debounce;
};

export default usePDF;
