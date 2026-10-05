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
          <div>
            <Link
              href="/"
              aria-label="SEPY home"
              className="inline-block focus-visible:outline-none"
            >
              <Image
                src="/images/brand/sepy-wordmark.png"
                alt="SEPY"
                width={240}
                height={60}
                className="h-auto w-22 sm:w-26 md:w-28 lg:w-30"
              />
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-6 text-text-secondary">
              Performance, refined.
            </p>
          </div>

          <div className="w-full max-w-md lg:min-w-100">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-primary">
              Stay in motion
            </p>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              New releases, collections and updates.
            </p>

            <form
              action="/api/subscribe"
              method="post"
              className="mt-5 flex border-b border-border-strong"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>

              <input
                id="footer-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Your email address"
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
              />

              <button
                type="submit"
                className="shrink-0 py-3 pl-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-primary transition-opacity duration-300 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 border-t border-border pt-12 sm:grid-cols-3 lg:mt-20 lg:grid-cols-[1fr_1fr_1fr]">
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
                      className="text-sm text-text-primary transition-opacity duration-300 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4"
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
        <div className="mt-14 flex flex-col gap-5 border-t border-border pt-6 text-[10px] uppercase tracking-[0.14em] text-text-muted sm:flex-row sm:items-center sm:justify-between">
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

function FooterLinkGroup({
  title,
  links,
}: FooterLinkGroupProps) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
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