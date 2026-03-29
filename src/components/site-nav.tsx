import Link from "next/link";

type NavKey = "home" | "about" | "blog";

const link =
  "text-[0.68rem] font-medium text-white/42 transition hover:text-white/85 sm:text-[0.8125rem]";
const currentLink = "text-[#39f3ff]/75";

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
