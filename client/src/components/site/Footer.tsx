import Image from "next/image";
import Link from "next/link";

const shopLinks = [
  { label: "Women", href: "/women" },
  { label: "Men", href: "/men" },
  { label: "Collections", href: "/collections" },
];

const helpLinks = [
  { label: "Contact", href: "/contact" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/",
  },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border  bg-surface">
      <div className="mx-auto max-w-420 px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        {/* Brand + Subscription */}
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="text-center sm:text-left">
            <Link
              href="/"
              aria-label="SEPY home"
              className="inline-block focus-visible:outline-none"
            >
              <Image
                src="/images/brand/sepy-symbol.png"
                alt="SEPY"
                width={240}
                height={60}
                className="h-auto w-22 sm:w-26 lg:w-28"
              />
            </Link>

            <p className="mt-5 max-w-xs text-sm font-semibold mx-auto sm:mx-0">
              Performance, refined.
            </p>
          </div>

          <div className="w-full max-w-md mx-auto sm:mx-0 text-center sm:text-left lg:min-w-100">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-primary">
              Stay in motion
            </p>

            <p className="mt-2 text-sm font-semibold">
              New releases, collections and updates.
            </p>

            <form
              action="/api/subscribe"
              method="post"
              className="
    mt-5 flex h-12 w-full items-stretch
    overflow-hidden
    border border-border-strong bg-white
    transition-colors duration-200
    hover:border-foreground
    focus-within:border-foreground
    focus-within:ring-1
    focus-within:ring-foreground
  "
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>

              <input
                id="footer-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                required
                placeholder="Your email address"
                className="
      min-w-0 flex-1 h-full
      appearance-none border-0
      rounded-none bg-transparent
      px-4 py-0
      text-sm font-bold text-foreground
      placeholder:font-normal
      placeholder:text-foreground/45
      outline-none ring-0
      focus:border-0 focus:outline-none
      focus:ring-0
    "
              />

              <button
                type="submit"
                className="
      flex h-full shrink-0 items-center justify-center
      self-stretch
      border-0 rounded-none
      bg-black px-4 sm:px-6
      text-xs font-bold uppercase
      tracking-[0.16em] text-white
      transition-colors duration-200
      hover:bg-foreground/80
      active:bg-foreground/70
      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-inset
      focus-visible:ring-white
    "
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 border-t border-border pt-12 sm:grid-cols-3 lg:mt-20 lg:grid-cols-[1fr_1fr_1fr] text-center sm:text-left font-semibold">
          <FooterLinkGroup title="Shop" links={shopLinks} />
          <FooterLinkGroup title="Help" links={helpLinks} />

          <div className="col-span-2 sm:col-span-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
              Follow
            </p>

            <nav aria-label="Social media" className="mt-5">
              <ul className="space-y-3">
                {socialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-text-primary transition-opacity duration-300 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4 font-bold"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col gap-5 border-t border-border pt-6 text-[10px] uppercase tracking-[0.14em] text-text-muted sm:flex-row items-center sm:justify-between text-center sm:text-left">
          <p>© {new Date().getFullYear()} SEPY</p>

          <nav aria-label="Legal">
            <ul className="flex items-center gap-5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-opacity duration-300 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

type FooterLinkGroupProps = {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
};

function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
        {title}
      </p>

      <nav aria-label={title} className="mt-5">
        <ul className="space-y-3">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm text-text-primary transition-opacity duration-300 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
