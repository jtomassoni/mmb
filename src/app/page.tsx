import type { ReactNode } from "react";

import { SiteNav } from "@/components/site-nav";
import { getSiteName } from "@/lib/site";

const siteName = getSiteName();

const doorDash = process.env.NEXT_PUBLIC_DOORDASH_URL?.trim() ?? "";

const orderBtnBase =
  "inline-flex min-h-[48px] w-full flex-1 cursor-pointer touch-manipulation items-center justify-center rounded-xl px-4 py-2.5 text-base font-extrabold leading-tight text-white shadow-md transition active:brightness-95 active:scale-[0.99] min-[480px]:text-lg sm:min-h-[64px] sm:rounded-2xl sm:px-5 sm:py-[1.1rem] sm:text-xl sm:shadow-lg sm:min-w-[220px] sm:flex-initial sm:hover:brightness-110 sm:active:scale-100";

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
    <div className="relative min-h-dvh overflow-x-hidden overflow-y-auto">
      <div aria-hidden className="hero-bg-stack" />

      <div
        className="relative z-10 mx-auto max-w-6xl px-2 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] max-sm:grid max-sm:min-h-[100dvh] max-sm:grid-rows-[auto_minmax(0,1fr)_auto] max-sm:gap-0 sm:flex sm:min-h-0 sm:flex-col sm:px-8 sm:py-6 sm:pb-6 lg:max-w-7xl lg:px-10"
      >
        {/* Brand — compact on mobile so burger grid owns the viewport */}
        <header className="shrink-0 text-center max-sm:py-0.5 sm:mb-0 lg:mb-4">
          <h1 className="neon-text-pink text-[clamp(1.05rem,4.8vw,3rem)] font-extrabold leading-[1.08] tracking-[0.05em] [font-family:var(--font-outrun),sans-serif] sm:text-[clamp(1.2rem,5.5vw,3rem)] sm:leading-tight sm:tracking-[0.1em]">
            {siteName}
          </h1>
          <p className="neon-text-cyan mt-0.5 text-[clamp(0.68rem,2vw,1.1rem)] font-semibold tracking-[0.12em] [text-shadow:0_0_14px_rgba(57,243,255,0.55)] sm:mt-1.5 sm:text-[clamp(0.72rem,2.2vw,1.1rem)] sm:tracking-[0.28em]">
            Smashed Fresh. Served Late.
          </p>
        </header>

        <main
          id="menu"
          className="mt-1.5 flex min-h-0 flex-col max-sm:h-full max-sm:min-h-0 sm:mt-5"
        >
          <div className="mx-auto flex min-h-0 min-w-0 w-full max-w-2xl flex-col max-sm:h-full max-sm:flex-1 sm:max-w-3xl lg:max-w-6xl xl:max-w-7xl">
            <section className="flex min-h-0 flex-col space-y-2.5 max-sm:flex-1 sm:space-y-3 lg:space-y-5">
              <h2 className="shrink-0 text-center text-base font-bold uppercase tracking-[0.28em] text-[#ff2d95] drop-shadow-[0_0_10px_rgba(255,45,149,0.45)] [font-family:var(--font-outrun),sans-serif] sm:text-lg sm:tracking-[0.35em] lg:text-2xl lg:tracking-[0.38em]">
                The menu
              </h2>
              <ul className="grid min-h-0 grid-cols-1 grid-rows-none items-stretch gap-3 max-sm:flex-1 sm:min-h-0 sm:grid-cols-2 sm:grid-rows-1 sm:gap-4 sm:items-start lg:gap-8 xl:gap-12">
                <li className="flex min-h-0 min-w-0">
                  <OrderableMenuCard
                    href={doorDash || undefined}
                    ariaLabel="Order The Smash on DoorDash"
                    ringVariant="pink"
                    className="flex min-h-0 w-full min-w-0 flex-col justify-start rounded-xl border-[2.5px] border-[#ff2d95]/55 bg-black/80 p-5 shadow-[0_0_28px_rgba(255,45,149,0.2)] backdrop-blur-sm max-sm:min-h-[12.5rem] sm:h-full sm:min-h-[11rem] sm:rounded-xl sm:border-2 sm:bg-black/75 sm:p-5 lg:rounded-2xl lg:border-[3px] lg:p-8 lg:shadow-[0_0_40px_rgba(255,45,149,0.18)] xl:p-10"
                  >
                    <div className="flex flex-col gap-1.5 border-b border-[#ff2d95]/25 pb-3 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-1.5 sm:pb-3 lg:pb-5">
                      <h3 className="text-[clamp(1.05rem,4.5vw,1.35rem)] font-bold leading-tight text-white [font-family:var(--font-outrun),sans-serif] sm:text-2xl lg:text-3xl xl:text-4xl">
                        The Smash
                      </h3>
                      <span className="neon-text-cyan text-[clamp(1.75rem,8vw,2.65rem)] font-extrabold tabular-nums leading-none sm:text-3xl lg:text-4xl xl:text-5xl">
                        $10
                      </span>
                    </div>
                    <p className="mt-3 text-[clamp(0.9rem,3.4vw,1.05rem)] leading-snug text-white [text-rendering:optimizeLegibility] max-sm:leading-relaxed sm:mt-3.5 sm:text-lg sm:leading-relaxed lg:mt-5 lg:text-xl lg:leading-relaxed xl:text-2xl xl:leading-relaxed">
                      1 beef patty, American cheese, brioche bun,
                      diced onions, house sauce
                    </p>
                  </OrderableMenuCard>
                </li>
                <li className="flex min-h-0 min-w-0">
                  <OrderableMenuCard
                    href={doorDash || undefined}
                    ariaLabel="Order The Double Smash on DoorDash"
                    ringVariant="cyan"
                    className="flex min-h-0 w-full min-w-0 flex-col justify-start rounded-xl border-[2.5px] border-[#39f3ff]/55 bg-black/80 p-5 shadow-[0_0_28px_rgba(57,243,255,0.2)] backdrop-blur-sm max-sm:min-h-[12.5rem] sm:h-full sm:min-h-[11rem] sm:rounded-xl sm:border-2 sm:bg-black/75 sm:p-5 lg:rounded-2xl lg:border-[3px] lg:p-8 lg:shadow-[0_0_40px_rgba(57,243,255,0.18)] xl:p-10"
                  >
                    <div className="flex flex-col gap-1.5 border-b border-[#39f3ff]/30 pb-3 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-1.5 sm:pb-3 lg:pb-5">
                      <h3 className="text-[clamp(1rem,4vw,1.3rem)] font-bold leading-tight text-white [font-family:var(--font-outrun),sans-serif] sm:text-2xl lg:text-3xl xl:text-4xl">
                        The Double Smash
                      </h3>
                      <span className="neon-text-cyan text-[clamp(1.75rem,8vw,2.65rem)] font-extrabold tabular-nums leading-none sm:text-3xl lg:text-4xl xl:text-5xl">
                        $15
                      </span>
                    </div>
                    <p className="mt-3 text-[clamp(0.9rem,3.4vw,1.05rem)] leading-snug text-white [text-rendering:optimizeLegibility] max-sm:leading-relaxed sm:mt-3.5 sm:text-lg sm:leading-relaxed lg:mt-5 lg:text-xl lg:leading-relaxed xl:text-2xl xl:leading-relaxed">
                      2 beef patties, 2 slices cheese, brioche
                      bun, diced onions, house sauce
                    </p>
                  </OrderableMenuCard>
                </li>
              </ul>
            </section>
          </div>
        </main>

        <div className="mt-2 flex shrink-0 flex-col gap-1.5 sm:contents">
          <section
            aria-label="Order delivery"
            className="shrink-0 rounded-xl border border-[#ff2d95]/45 bg-black/65 p-3 shadow-[0_0_28px_rgba(255,45,149,0.2)] backdrop-blur-md sm:mt-5 sm:rounded-2xl sm:p-6 sm:shadow-[0_0_40px_rgba(255,45,149,0.25)]"
          >
            <p className="mb-2 text-center text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#ff2d95] [font-family:var(--font-outrun),sans-serif] sm:mb-4 sm:text-xs sm:tracking-[0.35em]">
              Tap to order
            </p>
            <OrderCTAs className="gap-2 sm:gap-4" />
          </section>

          <p className="mx-auto w-full max-w-md text-balance text-center text-[0.65rem] font-medium leading-snug text-white/88 sm:mt-4 sm:max-w-2xl sm:text-base sm:leading-relaxed">
            Late-night delivery around{" "}
            <strong className="font-semibold text-white">Littleton</strong>,{" "}
            <strong className="font-semibold text-white">Englewood</strong> &{" "}
            <strong className="font-semibold text-white">Sheridan</strong>.
            Minority woman-owned. A new concept from a local staple.
          </p>

          <footer className="shrink-0 border-t border-white/10 pt-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] sm:mt-6 sm:pt-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
            <SiteNav current="home" />
            <p className="mt-1.5 text-center text-[0.6rem] text-white/35 sm:mt-3 sm:text-xs">
              &copy; {new Date().getFullYear()} {siteName.replace(/\s+/g, " ")}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
