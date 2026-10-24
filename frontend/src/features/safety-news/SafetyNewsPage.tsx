import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Newspaper,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { newsService } from '@/services/news/newsService';
import { storageService } from '@/services/storage/storageService';
import { SafetyNewsArticle } from '@/types';

export const SafetyNewsPage: React.FC = () => {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>(() => storageService.getSavedNewsIds());

  const articles = newsService.getArticles(category, search);

  const handleToggleBookmark = (id: string) => {
    storageService.toggleSaveNews(id);
    setSavedIds(storageService.getSavedNewsIds());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          Women’s Safety, Cyber Rights & Awareness News
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
          Curated advisories, landmark legal rights, cybercrime warnings, and actionable lessons linked directly to NIRBHAYA tools.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <Card style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 2, minWidth: '220px' }}>
          <Input
            placeholder="Search news by headline, summary, or safety lessons..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ flex: 1, minWidth: '180px' }}>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color-default)' }}
          >
            <option value="all">All News Categories</option>
            <option value="legal_rights">Legal Rights & Supreme Court</option>
            <option value="cybercrime">Cybercrime & Scam Warnings</option>
            <option value="deepfakes">Deepfake & Extortion Alerts</option>
            <option value="domestic_abuse">Domestic Violence & Sakhi Shelters</option>
            <option value="advisory">Digital Privacy Advisories</option>
          </select>
        </div>
      </Card>

      {/* Articles Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {articles.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <Newspaper size={40} color="var(--color-neutral-400)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No News Items Found</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Try adjusting your category filter or search keywords.
            </p>
          </Card>
        ) : (
          articles.map(article => {
            const isBookmarked = savedIds.includes(article.id);
            return (
              <Card key={article.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <Badge variant="info">{article.category.replace('_', ' ')}</Badge>
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
                        Read Official Source <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleBookmark(article.id)}
                    style={{
                      padding: '8px',
                      color: isBookmarked ? 'var(--color-brand-primary)' : 'var(--color-neutral-400)',
                      cursor: 'pointer'
                    }}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark this article'}
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
