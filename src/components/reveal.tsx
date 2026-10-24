"use client";

import type { ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";

/** Wraps children in a scroll-revealed element. `delay` staggers siblings (ms). */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={className} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}
