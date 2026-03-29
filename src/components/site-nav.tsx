import Link from "next/link";

type NavKey = "home" | "about" | "blog";

const link =
  "text-base font-medium text-[#b8f7ff]/90 transition hover:text-white sm:text-[0.875rem]";
const currentLink = "text-[#39f3ff] drop-shadow-[0_0_1px_rgb(0_0_0/0.85)]";

/** Quiet footer-style links. Use at the bottom of the page, not under the logo. */
export function SiteNav({
  current,
  className = "",
}: {
  current: NavKey;
  className?: string;
}) {
  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:gap-x-7 ${className}`}
      aria-label="Site pages"
    >
      <Link
        href="/"
        className={`${link} ${current === "home" ? currentLink : ""}`}
      >
        Home
      </Link>
      <Link
        href="/about"
        className={`${link} ${current === "about" ? currentLink : ""}`}
      >
        About
      </Link>
      <Link
        href="/blog"
        className={`${link} ${current === "blog" ? currentLink : ""}`}
      >
        Blog
      </Link>
    </nav>
  );
}
