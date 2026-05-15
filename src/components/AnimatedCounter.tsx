"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface CountUpProps {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function CountUp({
  to,
  duration = 1800,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  style,
}: CountUpProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    const startTime = performance.now();
    const factor = Math.pow(10, decimals);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased * factor) / factor);
      if (progress < 1) requestAnimationFrame(tick);
      else setValue(to);
    };

    requestAnimationFrame(tick);
  }, [inView, to, duration, decimals]);

  const formatted =
    decimals > 0
      ? value.toLocaleString("es-MX", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : value.toLocaleString("es-MX");

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
