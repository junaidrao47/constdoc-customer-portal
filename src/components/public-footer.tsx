import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-primary px-6 py-10 text-primary-foreground/70">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 text-sm">
        <p>ConstDoc · Construction compliance service management</p>
        <div className="flex gap-4">
          <Link href="/contact" className="hover:text-primary-foreground">
            Contact
          </Link>
          <Link href="/faq" className="hover:text-primary-foreground">
            FAQ
          </Link>
          <Link href="/login" className="hover:text-primary-foreground">
            Customer portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
