import type { Metadata } from "next";
import Link from "next/link";
import { FloatingOrderButton } from "@/components/floating-order-button";
import { PageScene } from "@/components/page-scene";
import { SiteNav } from "@/components/site-nav";
import { blogPosts } from "@/lib/blog-posts";
import { getSiteName } from "@/lib/site";

const siteName = getSiteName();

export const metadata: Metadata = {
  title: `Blog | ${siteName}`,
  description: `Updates from the kitchen: opening prep, delivery zone, and late night smash burgers in south Denver.`,
  openGraph: {
    title: `Blog | ${siteName}`,
    description: "Opening soon. Stories from the build, the menu, and the neighborhood.",
  },
};

function formatDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogIndexPage() {
  const sorted = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <PageScene>
      <FloatingOrderButton />
      <header className="text-center">
        <p className="neon-text-pink text-xs font-bold uppercase tracking-[0.35em] [font-family:var(--font-outrun),sans-serif]">
          Blog
        </p>
        <h1 className="neon-text-pink mt-2 text-2xl font-extrabold tracking-[0.06em] [font-family:var(--font-outrun),sans-serif] sm:text-3xl">
          Opening notes
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-white/80 sm:text-base">
          How we are getting ready to serve late night smash burgers for
          delivery.
        </p>
      </header>

      <ul className="mt-8 space-y-4">
        {sorted.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="block rounded-xl border border-white/10 bg-black/45 p-4 transition hover:border-[#ff2d95]/40 hover:bg-black/55 sm:p-5"
            >
              <time
                dateTime={post.date}
                className="text-xs font-medium uppercase tracking-wider text-white/45"
              >
                {formatDate(post.date)}
              </time>
              <h2 className="mt-1.5 text-lg font-bold text-white sm:text-xl">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-base">
                {post.excerpt}
              </p>
              <span className="mt-3 inline-block text-sm font-semibold text-[#39f3ff]">
                Read post
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <footer className="mt-12 border-t border-white/10 pt-6 text-center">
        <SiteNav current="blog" />
        <p className="mt-4 text-xs text-white/35">
          &copy; {new Date().getFullYear()} {siteName.replace(/\s+/g, " ")}
        </p>
      </footer>
    </PageScene>
  );
}
