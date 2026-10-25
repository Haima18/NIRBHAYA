import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Newspaper,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { newsService } from '@/services/news/newsService';
import { storageService } from '@/services/storage/storageService';
import { SafetyNewsArticle } from '@/types';
export const SafetyNewsPage: React.FC = () => {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>(() => storageService.getSavedNewsIds());
  const [liveArticles, setLiveArticles] = useState<SafetyNewsArticle[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState<string | null>(null);

  const articles = newsService.getArticles(category, search);

  const loadLiveArticles = async () => {
    setLiveLoading(true);
    setLiveError(null);
    try {
      const items = await newsService.getLatestArticles();
      setLiveArticles(items);
      setLiveError(null);
    } catch (error) {
      setLiveArticles([]);
      setLiveError(error instanceof Error ? error.message : 'Global news is temporarily unavailable.');
    } finally {
      setLiveLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;
    newsService.getLatestArticles()
      .then(items => {
        if (isCurrent) {
          setLiveArticles(items);
          setLiveError(null);
        }
      })
      .catch(error => {
        if (isCurrent) {
          setLiveArticles([]);
          setLiveError(error instanceof Error ? error.message : 'Global news is temporarily unavailable.');
        }
      })
      .finally(() => {
        if (isCurrent) setLiveLoading(false);
      });
    return () => { isCurrent = false; };
  }, []);

  const handleToggleBookmark = (id: string) => {
    storageService.toggleSaveNews(id);
    setSavedIds(storageService.getSavedNewsIds());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Global Safety News & Awareness
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          Recent global reports alongside an evergreen library of safety guidance and official resources.
        </p>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Latest global reports</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>
              Today and yesterday from GDELT, UN Women, The 19th, The Fuller Project, and UN News. Publisher content and claims are external and are not verified by NIRBHAYA.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadLiveArticles()}
            disabled={liveLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: liveLoading ? 'wait' : 'pointer' }}
          >
            <RefreshCw size={15} /> {liveLoading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        {liveLoading ? (
          <p role="status" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Loading current headlines…</p>
        ) : liveError ? (
          <Alert type="warning" title="Live headlines are temporarily unavailable">
            {liveError} The awareness library below remains available offline.{' '}
            <a href="https://www.unwomen.org/en/news-stories" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', fontWeight: 600 }}>
              Open UN Women’s news directly
            </a>.
          </Alert>
        ) : liveArticles.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>No matching headlines were returned. Try refreshing later.</p>
        ) : (
          <div style={{ display: 'grid', gap: '0.65rem' }}>
            {liveArticles.map(article => (
              <article key={article.id} style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-app)', border: '1px solid var(--border-color-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                  <Badge variant="info">{article.publisher}</Badge>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{article.date}</span>
                </div>
                <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 650, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {article.headline} <ExternalLink size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </a>
              </article>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Women-focused news sources</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
          Open publishers directly for their latest reporting. NIRBHAYA does not endorse every report or verify publisher claims.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem 1rem', flexWrap: 'wrap' }}>
          <a href="https://www.unwomen.org/en/news-stories" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-info)', fontSize: '0.85rem' }}>
            UN Women — News and stories <ExternalLink size={14} />
          </a>
          <a href="https://19thnews.org/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-info)', fontSize: '0.85rem' }}>
            The 19th — Women, gender, politics <ExternalLink size={14} />
          </a>
          <a href="https://fullerproject.org/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-info)', fontSize: '0.85rem' }}>
            The Fuller Project — Women-focused reporting <ExternalLink size={14} />
          </a>
          <a href="https://www.equaltimes.org/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-info)', fontSize: '0.85rem' }}>
            Equal Times — Archive (publication ended 2025) <ExternalLink size={14} />
          </a>
          <a href="https://womennews.in/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-info)', fontSize: '0.85rem' }}>
            WomenNews.in — Latest women’s news <ExternalLink size={14} />
          </a>
        </div>
      </Card>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Evergreen awareness library</h2>
      <Alert type="info" title="General guidance—not current reporting">
        These app-authored notes are kept separate from live headlines. Verify every link and any legal procedure with
        the official source before relying on it.
      </Alert>

      <Card style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 2, minWidth: '220px' }}>
          <Input
            placeholder="Search awareness notes by topic or safety lesson..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ flex: 1, minWidth: '180px' }}>
          <label htmlFor="awareness-category" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
            Topic
          </label>
          <select
            id="awareness-category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          >
            <option value="all">All topics</option>
            <option value="legal_rights">Legal rights</option>
            <option value="cybercrime">Cybercrime & account safety</option>
            <option value="deepfakes">Intimate-image abuse & deepfakes</option>
            <option value="domestic_abuse">Domestic abuse & support centres</option>
            <option value="advisory">Privacy advisories</option>
          </select>
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {articles.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <Newspaper size={40} color="var(--color-neutral-400)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No awareness notes found</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Try adjusting the topic filter or search keywords.
            </p>
          </Card>
        ) : (
          articles.map(article => {
            const isBookmarked = savedIds.includes(article.id);
            return (
              <Card key={article.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <Badge variant="info">{article.category.replace('_', ' ')}</Badge>
                      <Badge variant="neutral">Evergreen note</Badge>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {article.publisher} • {article.date}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
                      {article.headline}
                    </h2>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
                      {article.summary}
                    </p>

                    {/* Actionable Safety Lesson */}
                    <div
                      style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--color-brand-primary-subtle)',
                        borderLeft: '4px solid var(--color-brand-primary)',
                        borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        marginBottom: '0.75rem'
                      }}
                    >
                      <strong style={{ color: 'var(--color-brand-primary)' }}>💡 Key Safety Takeaway:</strong>{' '}
                      {article.safetyLesson}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Link
                        to={article.relatedFeatureRoute}
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'var(--color-brand-primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        Launch Relevant NIRBHAYA Tool <ArrowRight size={13} />
                      </Link>

                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--color-info)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        Open official source <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleBookmark(article.id)}
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this awareness note'}
                    style={{
                      padding: '8px',
                      background: 'none',
                      border: 'none',
                      color: isBookmarked ? 'var(--color-brand-primary)' : 'var(--color-neutral-400)',
                      cursor: 'pointer'
                    }}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark this awareness note'}
                  >
                    {isBookmarked ? <BookmarkCheck size={22} /> : <Bookmark size={22} />}
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
