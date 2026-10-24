"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

const MAX_DEG = 6;

/**
 * Pointer-driven 3D tilt with a moving glare, no libraries.
 *
 * `perspective(900px)` on the frame, `rotateX/rotateY` (≤6°) on the inner layer, and two
 * CSS vars (`--glare-x/y`) drive a highlight. Disabled on touch (pointerType !== "mouse")
 * and under `prefers-reduced-motion` — those get a plain static card. Inner layers can use
 * `translateZ` via the `tilt-layer` utility classes the children bring.
 */
export function TiltCard({
  children,
  className,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  glare?: boolean;
}) {
  const inner = useRef<HTMLDivElement>(null);

  const reduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const node = inner.current;
    if (!node || e.pointerType !== "mouse" || reduced()) return;
    const rect = node.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 2 * MAX_DEG;
    const rotateX = -(py - 0.5) * 2 * MAX_DEG;
    node.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    node.style.setProperty("--glare-x", `${px * 100}%`);
    node.style.setProperty("--glare-y", `${py * 100}%`);
    node.style.setProperty("--glare-o", "0.35");
  }

  function reset() {
    const node = inner.current;
    if (!node) return;
    node.style.transform = "";
    node.style.setProperty("--glare-o", "0");
  }

  return (
    <div
      className={cn("group/tilt [perspective:900px]", className)}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <div
        ref={inner}
        className="relative h-full [transform-style:preserve-3d] transition-transform duration-300 [transition-timing-function:var(--ease)] will-change-transform"
      >
        {children}
        {glare && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-xl opacity-[var(--glare-o,0)] transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(240px circle at var(--glare-x,50%) var(--glare-y,0%), rgba(255,255,255,0.55), transparent 60%)",
            }}
          />
        )}
      </div>
    </div>
  );
}
