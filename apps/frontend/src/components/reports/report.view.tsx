// The report itself, used by the public share page. Plain CSS so it looks
// the same on screen and when printed to PDF.
type Totals = {
  posts: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagement: number;
};
export type ReportData = {
  month: string;
  label: string;
  timezone: string;
  brand: { name: string; logoUrl: string | null; accent: string };
  totals: Totals;
  previous: Totals;
  byPlatform: { platform: string; posts: number; views: number; engagement: number }[];
  topPosts: {
    text: string;
    platform: string;
    channel: string;
    date: string;
    url: string | null;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement: number;
  }[];
  bestDay: { day: string; posts: number } | null;
  note: string;
  generatedAt: string;
};

const n = (v: number) => Intl.NumberFormat('en-US').format(Math.round(v || 0));
const change = (now: number, before: number) => {
  if (!before) return now ? 'new' : '—';
  const pct = ((now - before) / before) * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`;
};
const name = (p: string) => p.charAt(0).toUpperCase() + p.slice(1);

export const ReportView = ({ data, actions }: { data: ReportData; actions?: React.ReactNode }) => {
  const accent = /^#[0-9a-fA-F]{6}$/.test(data.brand.accent) ? data.brand.accent : '#086b31';
  const kpis: [string, number, number][] = [
    ['Posts', data.totals.posts, data.previous.posts],
    ['Views', data.totals.views, data.previous.views],
    ['Engagements', data.totals.engagement, data.previous.engagement],
    ['Comments', data.totals.comments, data.previous.comments],
  ];
  const maxEng = Math.max(1, ...data.byPlatform.map((p) => p.engagement));
  return (
    <div className="rpt">
      <style>{`
        .rpt { --accent: ${accent}; background: #f4f5f2; color: #17191e; font-family: Inter, -apple-system, "Segoe UI", Roboto, sans-serif; min-height: 100vh; padding: 32px 16px; box-sizing: border-box; }
        .rpt * { box-sizing: border-box; }
        .rpt-page { max-width: 820px; margin: 0 auto; background: #fff; border-radius: 14px; padding: 36px; box-shadow: 0 1px 6px rgba(0,0,0,.06); display: flex; flex-direction: column; gap: 28px; }
        .rpt-head { display: flex; align-items: center; gap: 16px; border-bottom: 4px solid var(--accent); padding-bottom: 18px; }
        .rpt-head img { width: 56px; height: 56px; object-fit: contain; border-radius: 10px; }
        .rpt-head h1 { margin: 0; font-size: 24px; }
        .rpt-head .sub { color: #5c626d; font-size: 14px; margin-top: 2px; }
        .rpt-actions { margin-left: auto; display: flex; gap: 8px; }
        .rpt-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .rpt-kpi { border: 1px solid #e4e6e2; border-radius: 10px; padding: 14px; }
        .rpt-kpi .label { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #6a707b; }
        .rpt-kpi .value { font-size: 26px; font-weight: 700; margin-top: 4px; font-variant-numeric: tabular-nums; }
        .rpt-kpi .delta { font-size: 12px; color: #6a707b; margin-top: 2px; }
        .rpt h2 { font-size: 16px; margin: 0 0 10px; }
        .rpt-bars { display: flex; flex-direction: column; gap: 8px; }
        .rpt-bar { display: grid; grid-template-columns: 110px 1fr 140px; gap: 10px; align-items: center; font-size: 13px; }
        .rpt-bar .track { height: 12px; background: #eef0ec; border-radius: 6px; overflow: hidden; }
        .rpt-bar .fill { height: 100%; background: var(--accent); border-radius: 6px; }
        .rpt-bar .nums { text-align: right; color: #5c626d; font-variant-numeric: tabular-nums; }
        .rpt table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .rpt th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #6a707b; padding: 6px 8px; border-bottom: 1px solid #e4e6e2; }
        .rpt td { padding: 8px; border-bottom: 1px solid #f0f1ee; vertical-align: top; }
        .rpt td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
        .rpt td a { color: inherit; }
        .rpt-note { font-size: 12px; color: #6a707b; }
        .rpt-btn { border: 1px solid var(--accent); background: var(--accent); color: #fff; border-radius: 8px; padding: 8px 14px; font-weight: 600; cursor: pointer; font-size: 13px; }
        @media (max-width: 640px) { .rpt-page { padding: 20px; } .rpt-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); } .rpt-bar { grid-template-columns: 80px 1fr; } .rpt-bar .nums { grid-column: 1 / -1; text-align: left; } .rpt-head { flex-wrap: wrap; } }
        @media print { .rpt { background: #fff; padding: 0; } .rpt-page { box-shadow: none; border-radius: 0; padding: 0; max-width: none; } .rpt-actions { display: none; } .rpt-kpi, tr { break-inside: avoid; } @page { margin: 16mm; } }
      `}</style>
      <div className="rpt-page">
        <div className="rpt-head">
          {data.brand.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.brand.logoUrl} alt="" />
          )}
          <div>
            <h1>{data.brand.name ? `${data.brand.name} · ` : ''}Social media report</h1>
            <div className="sub">{data.label} · posts published this month, measured through {new Date(data.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          </div>
          {actions && <div className="rpt-actions">{actions}</div>}
        </div>

        <div className="rpt-kpis">
          {kpis.map(([label, now, before]) => (
            <div className="rpt-kpi" key={label}>
              <div className="label">{label}</div>
              <div className="value">{n(now)}</div>
              <div className="delta">{change(now, before)} vs previous month</div>
            </div>
          ))}
        </div>

        <div>
          <h2>Engagement by platform</h2>
          {data.byPlatform.length ? (
            <div className="rpt-bars">
              {data.byPlatform.map((p) => (
                <div className="rpt-bar" key={p.platform}>
                  <div>{name(p.platform)}</div>
                  <div className="track">
                    <div className="fill" style={{ width: `${(p.engagement / maxEng) * 100}%` }} />
                  </div>
                  <div className="nums">
                    {n(p.engagement)} eng. · {n(p.views)} views · {p.posts} posts
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rpt-note">No measured posts this month.</div>
          )}
        </div>

        {!!data.topPosts.length && (
          <div>
            <h2>Top posts</h2>
            <table>
              <thead>
                <tr>
                  <th>Post</th>
                  <th>Channel</th>
                  <th style={{ textAlign: 'right' }}>Views</th>
                  <th style={{ textAlign: 'right' }}>Likes</th>
                  <th style={{ textAlign: 'right' }}>Comments</th>
                  <th style={{ textAlign: 'right' }}>Shares</th>
                </tr>
              </thead>
              <tbody>
                {data.topPosts.map((p, i) => (
                  <tr key={i}>
                    <td>
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noreferrer">
                          {p.text || '(no text)'}
                        </a>
                      ) : (
                        p.text || '(no text)'
                      )}
                      <div className="rpt-note">{new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </td>
                    <td>
                      {p.channel}
                      <div className="rpt-note">{name(p.platform)}</div>
                    </td>
                    <td className="num">{n(p.views)}</td>
                    <td className="num">{n(p.likes)}</td>
                    <td className="num">{n(p.comments)}</td>
                    <td className="num">{n(p.shares)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div>
          <h2>Highlights</h2>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
            <li>
              {n(data.totals.likes)} likes, {n(data.totals.comments)} comments, {n(data.totals.shares)} shares and {n(data.totals.saves)} saves.
            </li>
            {data.byPlatform[0] && <li>{name(data.byPlatform[0].platform)} brought the most engagement.</li>}
            {data.bestDay && (
              <li>
                Posts on {data.bestDay.day} did best on average ({data.bestDay.posts} posts).
              </li>
            )}
          </ul>
        </div>

        <div className="rpt-note">
          {data.note} Times in {data.timezone}. Made with Wrecking Social.
        </div>
      </div>
    </div>
  );
};
