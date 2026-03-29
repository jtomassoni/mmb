import type { ReactNode } from "react";

export function PageScene({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden overflow-y-auto">
      <div aria-hidden className="hero-bg-stack" />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-6 sm:px-8 sm:py-10 lg:max-w-4xl">
        {children}
      </div>
    </div>
  );
}
