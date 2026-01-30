import { useRef, useEffect } from 'react';

/**
 * Hook that returns a ref that always points to the latest value
 * @param value The value to track
 * @returns A ref that always contains the latest value
 */
export function useLatest(value) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

/**
 * Wraps a number within a range
 * @param min The minimum value
 * @param max The maximum value
 * @param value The value to wrap
 * @returns The wrapped value
 */
export function wrap(min, max, value) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}
