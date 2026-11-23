export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { internalFetch } from '@gitroom/helpers/utils/internal.fetch';

type BioPage = {
  slug: string;
  title: string;
  bio: string;
  avatarUrl: string | null;
  accent: string;
  links: { id: string; label: string }[];
};

const load = async (slug: string, view: boolean): Promise<BioPage | null> => {
  if (!/^[a-z0-9-]{3,40}$/.test(slug)) return null;
  const res = await internalFetch(`/public/bio/${slug}${view ? '?view=1' : ''}`);
  if (!res.ok) return null;
  return res.json();
};

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await load(slug, false);
  if (!page) return { title: 'Not found' };
  return {
    title: page.title,
    description: page.bio || `Links from ${page.title}`,
    openGraph: {
      title: page.title,
      description: page.bio || undefined,
      images: page.avatarUrl ? [page.avatarUrl] : undefined,
    },
  };
}

export default async function BioPublicPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const page = await load(slug, true);
  if (!page) notFound();
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '/api';
  const accent = /^#[0-9a-fA-F]{6}$/.test(page.accent) ? page.accent : '#086b31';

  return (
    <main className="bio">
      <style>{`
        .bio { min-height: 100vh; background: #f5f6f4; color: #16181d; font-family: Inter, -apple-system, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; padding: 48px 16px; box-sizing: border-box; }
        .bio * { box-sizing: border-box; }
        .bio-card { width: 100%; max-width: 480px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .bio-avatar { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; border: 3px solid #fff; box-shadow: 0 2px 10px rgba(0,0,0,.08); }
        .bio h1 { font-size: 22px; margin: 4px 0 0; text-align: center; }
        .bio p { margin: 0; color: #555b66; text-align: center; line-height: 1.5; font-size: 15px; white-space: pre-line; }
        .bio-links { width: 100%; display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
        .bio-link { display: block; width: 100%; padding: 16px 18px; border-radius: 14px; background: #fff; color: #16181d; text-decoration: none; text-align: center; font-weight: 600; font-size: 16px; border: 2px solid ${accent}; transition: transform .1s ease, background .1s ease; }
        .bio-link:hover, .bio-link:focus-visible { background: ${accent}; color: #fff; transform: translateY(-1px); outline: none; }
        .bio-foot { margin-top: 28px; font-size: 12px; color: #8a8f99; }
        .bio-foot a { color: inherit; }
        @media (prefers-color-scheme: dark) {
          .bio { background: #121418; color: #eceef2; }
          .bio p { color: #a5abb6; }
          .bio-link { background: #1c1f25; color: #eceef2; }
          .bio-avatar { border-color: #1c1f25; }
        }
        @media (prefers-reduced-motion: reduce) { .bio-link { transition: none; } }
      `}</style>
      <div className="bio-card">
        {page.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="bio-avatar" src={page.avatarUrl} alt="" />
        )}
        <h1>{page.title}</h1>
        {!!page.bio && <p>{page.bio}</p>}
        <nav className="bio-links">
          {page.links.map((link) => (
            <a
              key={link.id}
              className="bio-link"
              href={`${base}/public/bio/${page.slug}/go/${encodeURIComponent(link.id)}`}
              rel="noopener"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="bio-foot">
          <a href="/">Made with Wrecking Social</a>
        </div>
      </div>
    </main>
  );
}
