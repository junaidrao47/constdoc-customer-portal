"use client";

import { clients, clientsAvailable, type Client } from "@/data/clients";
import { useLocale } from "@/lib/use-locale";

function LogoTile({ client }: { client: Client }) {
  return (
    <div className="group/logo mx-3 flex h-20 w-40 shrink-0 items-center justify-center rounded-md border border-border bg-paper px-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[var(--elev-2)]">
      {/* Plain <img>, not next/image: these are trusted local SVGs and the image optimizer
          rejects SVG unless `dangerouslyAllowSVG` is set. Matches the pattern in cards.tsx. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={client.file}
        alt={client.name}
        width={120}
        height={40}
        loading="lazy"
        className="h-10 w-auto max-w-[120px] object-contain opacity-60 grayscale transition-all duration-500 ease-out group-hover/logo:scale-105 group-hover/logo:opacity-100 group-hover/logo:grayscale-0"
      />
    </div>
  );
}

function MarqueeRow({ items, dir }: { items: Client[]; dir: "left" | "right" }) {
  return (
    <div className="marquee-row relative overflow-hidden py-2">
      <div className={`marquee-track marquee-${dir}`}>
        {items.map((c) => (
          <LogoTile key={`${dir}-a-${c.slug}`} client={c} />
        ))}
        <div className="marquee-dupe flex" aria-hidden>
          {items.map((c) => (
            <LogoTile key={`${dir}-b-${c.slug}`} client={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Client-logo trust band: two marquee rows in opposite directions, each track duplicated for
 * a seamless loop and paused on hover. Each logo sits in grayscale at rest and reveals its
 * brand color, lifts and scales on hover. Edge-fade masks hide the wrap point, and the whole
 * band fades up on first paint. Under `prefers-reduced-motion` the CSS stops the animation,
 * drops the duplicate copy and lets the row wrap into a centered static grid. Renders nothing
 * until `public/clients/*.svg` exist (see `data/clients.ts`).
 */
export function TrustBand() {
  const locale = useLocale();
  if (!clientsAvailable) return null;

  const mid = Math.ceil(clients.length / 2);
  const rowA = clients.slice(0, mid);
  const rowB = clients.slice(mid).length ? clients.slice(mid) : clients.slice(0, mid);

  const title =
    locale === "en" ? "Organizations we've worked with" : "Empresas que han confiado en nosotros";

  return (
    <section
      className="rise border-y border-border bg-background"
      aria-label={title}
      style={{
        maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="eyebrow text-center text-xs text-muted-foreground">{title}</p>
        <div className="mt-6 flex flex-col gap-3">
          <MarqueeRow items={rowA} dir="left" />
          <MarqueeRow items={rowB} dir="right" />
        </div>
      </div>
    </section>
  );
}
