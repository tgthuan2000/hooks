import type { DependencyList } from 'react';
import { useCallback, useEffect, useRef } from 'react';

const useBeforeUnloadEffect = (callback: () => boolean, deps?: DependencyList) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const onBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (callbackRef.current()) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useBeforeUnloadEffect;
