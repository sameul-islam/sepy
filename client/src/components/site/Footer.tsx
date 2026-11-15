import Image from "next/image";
import Link from "next/link";
import {
  FaInstagram,
  FaFacebookF,
  FaTiktok,
} from "react-icons/fa6";

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
    Icon: FaInstagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    Icon: FaFacebookF,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/",
    Icon: FaTiktok,
  },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="bg-[#111311] text-[#F3F3EF]">
      <div className="mx-auto max-w-420 px-5 sm:px-8 lg:px-12">

        {/* Brand and Newsletter */}
        <div className="grid gap-12 border-b border-white/10 py-14 sm:py-16 lg:grid-cols-[1fr_0.85fr] lg:items-end lg:gap-20 lg:py-20">

          {/* Brand */}
          <div>
            <Link
              href="/"
              aria-label="SEPY home"
              className="inline-flex focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <Image
                src="/images/brand/sepy-symbol.png"
                alt="SEPY"
                width={240}
                height={60}
                className="h-auto w-24 brightness-0 invert sm:w-28"
              />
            </Link>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
              Performance, refined.
            </p>

            <h2 className="mt-7 max-w-lg text-3xl font-extrabold uppercase leading-[1.08] tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              Move with
              <span className="block text-white/45">
                purpose.
              </span>
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">
              Designed for movement. Made for performance.
              Built for every day.
            </p>
          </div>

          {/* Newsletter */}
          <div className="w-full max-w-md lg:justify-self-end">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
              Stay in motion
            </p>

            <h3 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
              Get the latest from SEPY.
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/55">
              Discover new releases, collections and updates.
            </p>

            <div
              role="group"
              aria-label="Newsletter subscription"
              className="mt-6 flex h-12 w-full items-stretch border border-white/20 bg-white/4 transition-colors duration-300 focus-within:border-white/60 hover:border-white/40"
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
                placeholder="Your email address"
                className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/35"
              />

              <button
                type="button"
                className="shrink-0 border-l border-white/20 px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-white hover:text-[#111311] sm:px-6"
              >
                Subscribe
              </button>
            </div>

            <p className="mt-3 text-[10px] leading-5 text-white/35">
              Stay connected. No unnecessary noise.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-12 sm:grid-cols-3 lg:py-16">

          <FooterLinkGroup title="Shop" links={shopLinks} />

          <FooterLinkGroup title="Help" links={helpLinks} />

          {/* Social Media */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              Follow SEPY
            </p>

            <p className="mt-5 max-w-55 text-sm leading-6 text-white/55">
              Follow our journey and stay inspired to move.
            </p>

            <nav aria-label="Social media" className="mt-6">
              <ul className="flex items-center gap-3">
                {socialLinks.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`SEPY on ${label}`}
                      className="flex size-10 items-center justify-center border border-white/15 text-white/75 transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#111311] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                      <Icon aria-hidden="true" size={15} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-5 border-t border-white/10 py-6 text-center sm:flex-row sm:text-left">

          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/40">
            © {new Date().getFullYear()} SEPY. All rights reserved.
          </p>

          <nav aria-label="Legal">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/45 transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
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
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
        {title}
      </p>

      <nav aria-label={title} className="mt-5">
        <ul className="space-y-4">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm font-medium text-white/75 transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
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
