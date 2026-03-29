import type { ReactNode } from "react";

export function PageScene({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden overflow-y-auto">
      <div aria-hidden className="hero-bg-stack" />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col px-4 pt-[max(1.5rem,env(safe-area-inset-top,1.5rem))] pb-[max(1.5rem,env(safe-area-inset-bottom,1.5rem))] sm:px-8 sm:pt-[max(2.5rem,env(safe-area-inset-top,2.5rem))] sm:pb-[max(2.5rem,env(safe-area-inset-bottom,2.5rem))] lg:max-w-4xl">
        {children}
      </div>
    </div>
  );
}
