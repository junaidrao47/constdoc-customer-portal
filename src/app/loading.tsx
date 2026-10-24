import { BrandLoader } from "@/components/brand-loader";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <BrandLoader label="Loading your workspace…" />
    </main>
  );
}
