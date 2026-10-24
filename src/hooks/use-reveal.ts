"use client";

import { useEffect, useRef } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Reveals an element on scroll: fade + 24px rise, once.
 *
 * The hidden state (`reveal-init`) is applied only after mount, so server-rendered HTML,
 * no-JS and reduced-motion all render the content fully visible. Under reduced motion the
 * hook is a no-op. Returns a ref to attach to the element you want revealed.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: { threshold?: number; rootMargin?: string } = {},
) {
  const ref = useRef<T>(null);
  const { threshold = 0.15, rootMargin = "0px 0px -10% 0px" } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;

    el.classList.add("reveal-init");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.remove("reveal-init");
            el.classList.add("reveal-in");
            observer.unobserve(el);
          }
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
