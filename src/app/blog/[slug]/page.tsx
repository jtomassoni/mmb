import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FloatingOrderButton } from "@/components/floating-order-button";
import { PageScene } from "@/components/page-scene";
import { SiteNav } from "@/components/site-nav";
import { blogPosts, getPostBySlug } from "@/lib/blog-posts";
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
} from "@/lib/seo";
import { getSiteName, getSiteUrl } from "@/lib/site";

const siteName = getSiteName();

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post" };

  const base = getSiteUrl();
  const title = `${post.title} | ${siteName}`;
  const path = `/blog/${post.slug}`;
  return {
    title,
    description: post.excerpt,
    authors: [{ name: siteName }],
    alternates: { canonical: path },
    openGraph: {
      title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [siteName],
      url: path,
      images: [
        {
          url: OG_IMAGE_PATH,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.excerpt,
      images: [OG_IMAGE_PATH],
    },
  };
}

function formatDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const base = getSiteUrl();
  const origin = base?.replace(/\/$/, "") ?? "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.date,
    description: post.excerpt,
    author: {
      "@type": "Organization",
      name: siteName,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      ...(origin ? { url: `${origin}/` } : {}),
    },
    ...(base
      ? {
          url: `${base}/blog/${post.slug}`,
          image: [`${origin}${OG_IMAGE_PATH}`],
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${base}/blog/${post.slug}`,
          },
        }
      : {}),
  };

  return (
    <PageScene>
      <FloatingOrderButton />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header>
        <p className="text-center text-xs font-bold uppercase tracking-[0.35em] text-[#ff2d95] [font-family:var(--font-outrun),sans-serif]">
          Blog
        </p>
        <h1 className="neon-text-pink mt-2 text-balance text-center text-2xl font-extrabold leading-tight tracking-[0.04em] [font-family:var(--font-outrun),sans-serif] sm:text-3xl">
          {post.title}
        </h1>
        <time
          dateTime={post.date}
          className="mt-3 block text-center text-sm text-white/50"
        >
          {formatDate(post.date)}
        </time>
      </header>

      <article className="mt-8 max-w-none">
        {post.paragraphs.map((text, i) => (
          <p
            key={i}
            className="mb-5 text-base leading-relaxed text-white/92 last:mb-0 sm:text-lg"
          >
            {text}
          </p>
        ))}
      </article>

      <nav className="mt-10 flex flex-col items-center gap-4 border-t border-white/10 pt-8 sm:flex-row sm:justify-between">
        <Link
          href="/blog"
          className="text-sm font-semibold text-[#39f3ff] transition hover:text-white"
        >
          All posts
        </Link>
        <Link
          href="/"
          className="text-sm font-semibold text-white/60 transition hover:text-white"
        >
          Home
        </Link>
      </nav>

      <footer className="mt-10 border-t border-white/10 pt-8 text-center">
        <SiteNav current="blog" />
        <p className="mt-4 text-xs text-white/35">
          &copy; {new Date().getFullYear()} {siteName.replace(/\s+/g, " ")}
        </p>
      </footer>
    </PageScene>
  );
}
