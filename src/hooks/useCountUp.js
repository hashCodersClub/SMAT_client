import { useEffect, useRef, useState } from "react";

/*
|--------------------------------------------------------------------------
| useCountUp
|--------------------------------------------------------------------------
|
| Animates a number from its previous value to a new target whenever
| `value` changes — the "ticking counter" effect used on Stripe/Vercel
| dashboard stat cards. Pure requestAnimationFrame, no dependencies.
|
| Usage:
|   const animated = useCountUp(stats.total);
|   <span>{animated}</span>
|--------------------------------------------------------------------------
*/

export const useCountUp = (value, { duration = 600 } = {}) => {
  const [display, setDisplay] = useState(value || 0);
  const fromRef = useRef(value || 0);
  const frameRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = typeof value === "number" ? value : 0;

    if (from === to) {
      return undefined;
    }

    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-soft equivalent for JS interpolation
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplay(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  return display;
};

export default useCountUp;
