import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteNav } from "@/components/site-nav";
import { getSiteName } from "@/lib/site";

const siteName = getSiteName();

/** Home route: canonical + OG URL (title/description live on root layout). */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const doorDash = process.env.NEXT_PUBLIC_DOORDASH_URL?.trim() ?? "";

const orderBtnBase =
  "inline-flex min-h-[48px] w-full flex-1 cursor-pointer touch-manipulation items-center justify-center rounded-xl px-4 py-2.5 text-sm font-extrabold leading-snug text-white shadow-md transition active:brightness-95 active:scale-[0.99] sm:min-h-[64px] sm:rounded-2xl sm:px-5 sm:py-[1.1rem] sm:text-xl sm:shadow-lg sm:min-w-[220px] sm:flex-initial sm:hover:brightness-110 sm:active:scale-100";

const menuCardLinkRing =
  "text-inherit no-underline outline-none transition-[filter,transform] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black/80 active:brightness-[0.97] active:scale-[0.995]";

function OrderableMenuCard({
  href,
  ariaLabel,
  ringVariant,
  className,
  children,
}: {
  href: string | undefined;
  ariaLabel: string;
  ringVariant: "pink" | "cyan";
  className: string;
  children: ReactNode;
}) {
  const ring =
    ringVariant === "pink"
      ? "focus-visible:ring-[#ff2d95]"
      : "focus-visible:ring-[#39f3ff]";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} ${menuCardLinkRing} ${ring}`}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  return <article className={className}>{children}</article>;
}

function OrderCTAs({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-4 ${className}`}
    >
      {doorDash ? (
        <a
          href={doorDash}
          target="_blank"
          rel="noopener noreferrer"
          className={`${orderBtnBase} bg-[#ff3008] shadow-[0_0_32px_rgba(255,48,8,0.55),0_4px_24px_rgba(0,0,0,0.35)]`}
        >
          Order on DoorDash
        </a>
      ) : (
        <button
          type="button"
          className={`${orderBtnBase} border-0 bg-[#ff3008] shadow-[0_0_32px_rgba(255,48,8,0.55),0_4px_24px_rgba(0,0,0,0.35)]`}
        >
          Order on DoorDash
        </button>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden max-sm:flex max-sm:max-h-dvh max-sm:flex-col max-sm:overflow-hidden sm:overflow-y-auto">
      <div aria-hidden className="hero-bg-stack" />

      <div
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-2 pt-[max(0.75rem,env(safe-area-inset-top,0.75rem))] pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] max-sm:min-h-0 max-sm:flex-1 max-sm:overflow-hidden sm:px-8 sm:pt-[max(1.5rem,env(safe-area-inset-top,1.5rem))] sm:pb-[max(1.5rem,env(safe-area-inset-bottom,1.5rem))] lg:max-w-7xl lg:px-10"
      >
        {/* Brand + tagline + one-line blurb */}
        <header className="shrink-0 border-b border-white/10 pb-2 text-center max-sm:pt-0 sm:pb-5 lg:mb-4">
          <h1 className="neon-text-pink text-[clamp(1.05rem,4.8vw,3rem)] font-extrabold leading-[1.08] tracking-[0.04em] [font-family:var(--font-outrun),sans-serif] sm:text-[clamp(1.2rem,5.5vw,3rem)] sm:leading-tight sm:tracking-[0.1em]">
            {siteName}
          </h1>
          <p className="neon-text-cyan mt-0.5 text-[clamp(0.88rem,2.4vw,1.1rem)] font-semibold tracking-[0.08em] sm:mt-1.5 sm:text-[clamp(0.72rem,2.2vw,1.1rem)] sm:tracking-[0.28em]">
            Smashed Fresh. Served Late.
          </p>
          <p className="mx-auto mt-1.5 max-w-4xl text-sm font-medium leading-snug text-white/88 sm:mt-4 sm:max-w-3xl sm:text-base sm:leading-relaxed">
            Late-night delivery around{" "}
            <strong className="font-semibold text-white">Littleton</strong>,{" "}
            <strong className="font-semibold text-white">Englewood</strong> &{" "}
            <strong className="font-semibold text-white">Sheridan</strong>
            {" · "}
            Minority woman-owned — a new concept from a local staple.
          </p>
        </header>

        <main
          id="menu"
          className="mt-1 flex min-h-0 flex-1 flex-col overflow-hidden overscroll-contain max-sm:min-h-0 sm:mt-5 sm:flex-none sm:overflow-visible"
        >
          <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col pb-0 max-sm:min-h-0 sm:max-w-3xl lg:max-w-6xl xl:max-w-7xl">
            <section className="flex min-h-0 flex-1 flex-col gap-1.5 sm:gap-3 lg:gap-5">
              <h2 className="neon-text-pink shrink-0 py-0 text-center text-sm font-bold uppercase tracking-[0.24em] [font-family:var(--font-outrun),sans-serif] sm:py-0 sm:text-lg sm:tracking-[0.35em] lg:text-2xl lg:tracking-[0.38em]">
                The menu
              </h2>
              <ul className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-2 max-sm:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] sm:min-h-0 sm:grid-cols-2 sm:grid-rows-1 sm:gap-4 lg:gap-8 xl:gap-12">
                <li className="flex min-h-0 min-w-0">
                  <OrderableMenuCard
                    href={doorDash || undefined}
                    ariaLabel="Order The Smash on DoorDash"
                    ringVariant="pink"
                    className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border-[2.5px] border-[#ff2d95]/60 bg-gradient-to-b from-black/90 to-black/80 p-3 shadow-[0_0_28px_rgba(255,45,149,0.22),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:min-h-[11rem] sm:rounded-xl sm:border-2 sm:bg-black/75 sm:bg-none sm:p-5 sm:from-transparent sm:to-transparent sm:shadow-[0_0_40px_rgba(255,45,149,0.18)] sm:overflow-visible lg:rounded-2xl lg:border-[3px] lg:p-8 xl:p-10"
                  >
                    <div className="flex shrink-0 flex-row items-baseline justify-between gap-2 border-b border-[#ff2d95]/30 pb-2 sm:pb-3 lg:pb-5">
                      <h3 className="min-w-0 flex-1 text-left text-[clamp(0.95rem,0.5rem+2.6vmin,1.35rem)] font-bold leading-tight text-white [font-family:var(--font-outrun),sans-serif] sm:text-2xl lg:text-3xl xl:text-4xl">
                        The Smash
                      </h3>
                      <span className="neon-text-cyan shrink-0 text-[clamp(1.35rem,0.75rem+5vmin,2rem)] font-extrabold tabular-nums leading-none sm:text-3xl lg:text-4xl xl:text-5xl">
                        $10
                      </span>
                    </div>
                    <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto [-webkit-overflow-scrolling:touch] sm:mt-3.5 sm:overflow-visible sm:gap-2.5 lg:mt-5">
                      <p className="text-[clamp(0.8rem,0.48rem+2vmin,1rem)] font-medium leading-relaxed text-white [text-rendering:optimizeLegibility] sm:text-lg lg:text-xl xl:text-2xl">
                        Smashed beef patty, American cheese, brioche bun.
                      </p>
                      <p className="text-[clamp(0.8rem,0.48rem+2vmin,1rem)] leading-relaxed text-white/88 [text-rendering:optimizeLegibility] sm:text-lg sm:leading-relaxed lg:text-xl lg:leading-relaxed xl:text-2xl xl:leading-relaxed">
                        Diced onion and house sauce.
                      </p>
                    </div>
                  </OrderableMenuCard>
                </li>
                <li className="flex min-h-0 min-w-0">
                  <OrderableMenuCard
                    href={doorDash || undefined}
                    ariaLabel="Order The Double Smash on DoorDash"
                    ringVariant="cyan"
                    className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border-[2.5px] border-[#39f3ff]/60 bg-gradient-to-b from-black/90 to-black/80 p-3 shadow-[0_0_28px_rgba(57,243,255,0.2),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:min-h-[11rem] sm:rounded-xl sm:border-2 sm:bg-black/75 sm:bg-none sm:p-5 sm:from-transparent sm:to-transparent sm:shadow-[0_0_40px_rgba(57,243,255,0.18)] sm:overflow-visible lg:rounded-2xl lg:border-[3px] lg:p-8 xl:p-10"
                  >
                    <div className="flex shrink-0 flex-row items-baseline justify-between gap-2 border-b border-[#39f3ff]/35 pb-2 sm:pb-3 lg:pb-5">
                      <h3 className="min-w-0 flex-1 text-left text-[clamp(0.88rem,0.48rem+2.3vmin,1.3rem)] font-bold leading-snug text-white [font-family:var(--font-outrun),sans-serif] sm:text-2xl lg:text-3xl xl:text-4xl">
                        The Double Smash
                      </h3>
                      <span className="neon-text-cyan shrink-0 text-[clamp(1.35rem,0.75rem+5vmin,2rem)] font-extrabold tabular-nums leading-none sm:text-3xl lg:text-4xl xl:text-5xl">
                        $15
                      </span>
                    </div>
                    <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto [-webkit-overflow-scrolling:touch] sm:mt-3.5 sm:overflow-visible sm:gap-2.5 lg:mt-5">
                      <p className="text-[clamp(0.8rem,0.48rem+2vmin,1rem)] font-medium leading-relaxed text-white [text-rendering:optimizeLegibility] sm:text-lg lg:text-xl xl:text-2xl">
                        Two smashed patties, two slices American cheese, brioche bun.
                      </p>
                      <p className="text-[clamp(0.8rem,0.48rem+2vmin,1rem)] leading-relaxed text-white/88 [text-rendering:optimizeLegibility] sm:text-lg sm:leading-relaxed lg:text-xl lg:leading-relaxed xl:text-2xl xl:leading-relaxed">
                        Diced onion and house sauce.
                      </p>
                    </div>
                  </OrderableMenuCard>
                </li>
              </ul>
            </section>
          </div>
        </main>

        <div className="mt-1.5 flex shrink-0 flex-col gap-0.5 sm:contents">
          <section
            aria-label="Order delivery"
            className="shrink-0 rounded-xl border border-[#ff2d95]/45 bg-black/75 p-2 shadow-[0_0_20px_rgba(255,45,149,0.2)] backdrop-blur-md sm:mt-5 sm:rounded-2xl sm:p-6 sm:shadow-[0_0_40px_rgba(255,45,149,0.25)]"
          >
            <p className="neon-text-pink mb-1.5 text-center text-xs font-bold uppercase tracking-[0.18em] [font-family:var(--font-outrun),sans-serif] sm:mb-4 sm:text-sm sm:tracking-[0.3em]">
              Tap to order
            </p>
            <OrderCTAs className="gap-1.5 sm:gap-4" />
          </section>

          <footer className="shrink-0 border-t border-white/10 pt-2 pb-0.5 sm:mt-4 sm:pt-4 sm:pb-4">
            <SiteNav current="home" />
            <p className="mt-2 text-center text-xs leading-snug text-white/45 sm:mt-2 sm:text-xs">
              &copy; {new Date().getFullYear()} {siteName.replace(/\s+/g, " ")}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
