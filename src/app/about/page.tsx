import type { Metadata } from "next";
import Link from "next/link";
import { PageScene } from "@/components/page-scene";
import { SiteNav } from "@/components/site-nav";
import { getSiteName } from "@/lib/site";

const siteName = getSiteName();

export const metadata: Metadata = {
  title: `About | ${siteName}`,
  description: `Minority woman-owned smash burger delivery. Late night food around Littleton, Englewood, Sheridan and south Denver. New concept from a local staple.`,
  openGraph: {
    title: `About ${siteName}`,
    description:
      "Who we are, why two burgers, and how we are getting ready to serve south Denver late night.",
  },
};

export default function AboutPage() {
  return (
    <PageScene>
      <header className="text-center">
        <p className="neon-text-pink text-xs font-bold uppercase tracking-[0.35em] [font-family:var(--font-outrun),sans-serif]">
          About
        </p>
        <h1 className="neon-text-pink mt-2 text-2xl font-extrabold tracking-[0.06em] [font-family:var(--font-outrun),sans-serif] sm:text-3xl">
          {siteName}
        </h1>
      </header>

      <article className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-black/80 px-5 py-6 text-base leading-relaxed text-white/95 shadow-lg backdrop-blur-sm sm:px-8 sm:py-8 sm:text-lg">
        <p>
          We are a minority woman-owned team building a late night smash burger
          concept for delivery. Our menu stays small on purpose: two burgers,
          done consistently, so quality does not drop when the clock passes
          midnight.
        </p>
        <p>
          Midnight Smashers grows out of a relationship with a local staple you
          may already know. Same care for guests, new focus on smashed patties,
          American cheese, brioche, onions, and house sauce. Nothing cute on the
          menu. Just the food we want to order after a long shift.
        </p>
        <p>
          We are opening first for delivery around{" "}
          <strong className="text-white">Littleton</strong>,{" "}
          <strong className="text-white">Englewood</strong>, and{" "}
          <strong className="text-white">Sheridan</strong>, with room to grow
          across south Denver as we prove the routes and the times.
        </p>
        <p>
          This site went up early so people who find us in search can read
          our story, follow the blog, and jump into Uber Eats or DoorDash when
          we flip on. If you are reading this while we are still in prep mode,
          thanks for the early support.
        </p>
      </article>

      <p className="mt-10 text-center">
        <Link
          href="/"
          className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-[#ff2d95]/80 bg-gradient-to-b from-[#ff2d95]/22 to-black/78 px-8 text-base font-extrabold text-[#ff2d95] shadow-[0_0_28px_rgba(255,45,149,0.45),0_6px_20px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm transition hover:border-[#ff63b0] hover:from-[#ff2d95]/38 hover:text-[#ffb8dc] hover:shadow-[0_0_44px_rgba(255,45,149,0.55)] [font-family:var(--font-outrun),sans-serif] sm:min-h-[56px] sm:rounded-2xl sm:px-10 sm:text-lg"
        >
          Order here
        </Link>
      </p>

      <footer className="mt-12 border-t border-white/10 pt-6 text-center">
        <SiteNav current="about" />
        <p className="mt-4 text-xs text-white/35">
          &copy; {new Date().getFullYear()} {siteName.replace(/\s+/g, " ")}
        </p>
      </footer>
    </PageScene>
  );
}
