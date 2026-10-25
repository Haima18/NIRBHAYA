import { afterEach, describe, expect, it, vi } from 'vitest';
import { newsService } from '../services/news/newsService';

describe('Live global news service', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('maps external headlines to safe, source-linked articles', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        articles: [
          {
            url: 'https://news.example.org/story',
            title: '  Safety report  ',
            domain: 'news.example.org',
            seendate: '20260629T030107Z'
          },
          { url: 'javascript:alert(1)', title: 'Unsafe URL', domain: 'bad.example' },
          { url: 'https://news.example.org/untitled', title: '  ' }
        ]
      })
    }));

    const articles = await newsService.getLatestArticles();
    expect(articles).toHaveLength(1);
    expect(articles[0].headline).toBe('Safety report');
    expect(articles[0].sourceUrl).toBe('https://news.example.org/story');
    expect(articles[0].publisher).toBe('news.example.org');
    expect(articles[0].isEvergreen).toBeUndefined();
  });

  it('surfaces rate limits instead of hiding failed live data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'Live news sources are temporarily unavailable.' })
    }));
    await expect(newsService.getLatestArticles()).rejects.toThrow('Live news sources are temporarily unavailable.');
  });
});
