import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/packages", label: "Packages" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

export function PublicHeader() {
  return (
    <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
      <Link href="/" className="font-serif text-2xl font-bold">
        Const<span className="text-[#bb6b36]">Doc</span>
      </Link>
      <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hidden transition-colors hover:text-[#bb6b36] sm:block"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/login"
          className="rounded-full bg-[#203a3a] px-5 py-2.5 font-semibold text-white"
        >
          Customer portal
        </Link>
      </div>
    </nav>
  );
}
