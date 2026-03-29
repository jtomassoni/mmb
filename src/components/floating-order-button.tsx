import Link from "next/link";

/** Fixed CTA on blog routes — links to home where ordering lives. */
export function FloatingOrderButton() {
  return (
    <Link
      href="/"
      className="fixed bottom-5 right-5 z-50 inline-flex min-h-[52px] min-w-[10rem] items-center justify-center rounded-xl border border-[#ff2d95]/80 bg-gradient-to-b from-[#ff2d95]/22 to-black/78 px-6 text-base font-extrabold text-[#ff2d95] shadow-[0_0_28px_rgba(255,45,149,0.45),0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md transition hover:scale-[1.03] hover:border-[#ff63b0] hover:from-[#ff2d95]/38 hover:text-[#ffb8dc] hover:shadow-[0_0_44px_rgba(255,45,149,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff2d95] active:scale-[0.99] [font-family:var(--font-outrun),sans-serif] sm:bottom-8 sm:right-8 sm:min-h-[56px] sm:rounded-2xl sm:text-lg"
      aria-label="Order here — go to home"
    >
      Order here
    </Link>
  );
}
