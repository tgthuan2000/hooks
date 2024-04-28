import { useCallback, useEffect, useRef } from 'react';

const useDF = <T extends Record<string, unknown>>(
  cb: (params: T) => {
    commit: () => Promise<unknown>;
    resolved?: () => void;
    error?: (err: unknown) => void;
  },
  ms: number = 1000
) => {
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

      const { commit, resolved, error } = callback.current(params);

      timeout.current = setTimeout(async () => {
        try {
          await commit();
          resolved?.();
          timeout.current = null;
        } catch (err) {
          error?.(err);
        }
      }, ms);
    },
    [ms]
  );

  return debounce;
};

export default useDF;
