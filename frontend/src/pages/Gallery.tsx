import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Instagram, PlayCircle } from 'lucide-react';
import api from '@/lib/api';

interface MediaItem {
  id: string;
  mediaType: 'image' | 'video';
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  postedAt: string;
  sourceUrl: string | null;
}

type Filter = 'all' | 'image' | 'video';

const PAGE_SIZE = 24;

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'Everything' },
  { key: 'image', label: 'Photos' },
  { key: 'video', label: 'Videos' },
];

const Gallery = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  useEffect(() => {
    setItems([]);
    setPage(1);
    fetchPage(1, filter, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchPage = async (targetPage: number, currentFilter: Filter, replace: boolean) => {
    try {
      setLoading(true);
      const res = await api.get('/gallery', {
        params: {
          page: targetPage,
          limit: PAGE_SIZE,
          ...(currentFilter !== 'all' ? { type: currentFilter } : {}),
        },
      });
      setItems((prev) => (replace ? res.data.items : [...prev, ...res.data.items]));
      setTotal(res.data.total || 0);
      setHasMore(!!res.data.hasMore);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPage(next, filter, false);
  };

  return (
    <div className="min-h-screen">
      {/* Editorial hero */}
      <section className="relative overflow-hidden -mt-[4.5rem] gradient-hero noise">
        <div className="container mx-auto px-4 relative z-10 pt-40 pb-20 md:pt-48 md:pb-24">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-label mb-6"
          >
            From our Instagram
          </motion.p>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-black uppercase text-foreground leading-[0.9] tracking-tight text-6xl md:text-8xl"
            >
              The<br />
              <span className="gradient-text">Gallery</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="max-w-md"
            >
              <p dir="rtl" className="font-display font-bold text-xl text-muted-foreground/70 mb-3">
                لحظات من ميدان العمل
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Workshops, debates, campaigns, and the people behind them,
                {total > 0 && <span className="text-foreground font-semibold"> {total} moments</span>} straight
                from <span className="text-primary font-semibold">@istiqlalyouthacademy</span>.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filter tabs */}
      <div className="sticky top-[4.5rem] z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 flex items-center gap-8">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`relative py-4 text-sm font-semibold uppercase tracking-wider transition-colors ${
                filter === f.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
              {filter === f.key && (
                <motion.span
                  layoutId="gallery-filter"
                  className="absolute inset-x-0 -bottom-px h-[2px] bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry grid */}
      <section className="container mx-auto px-4 py-12">
        {loading && items.length === 0 ? (
          <div className="columns-2 md:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="mb-4 break-inside-avoid rounded-2xl bg-muted animate-pulse"
                style={{ height: `${180 + (i % 4) * 60}px` }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-20 text-center">
            <Instagram className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            <p className="font-display font-bold text-xl mb-1">Nothing here yet.</p>
            <p className="text-muted-foreground">New media lands here as soon as it's posted.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 xl:columns-4 gap-4">
            {items.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: Math.min((index % 8) * 0.05, 0.4) }}
                onClick={() => setSelected(item)}
                className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-border text-left"
              >
                <img
                  src={item.mediaType === 'video' ? item.thumbnailUrl || item.url : item.url}
                  alt={item.caption?.slice(0, 60) || 'Istiqlal Youth Academy'}
                  loading="lazy"
                  className="w-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {item.mediaType === 'video' && (
                  <span className="absolute top-3 right-3 rounded-full bg-black/50 backdrop-blur p-1.5 text-white">
                    <PlayCircle className="h-4 w-4" />
                  </span>
                )}
                {item.caption && (
                  <p className="absolute bottom-0 left-0 right-0 p-4 text-xs text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 line-clamp-2">
                    {item.caption}
                  </p>
                )}
              </motion.button>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="text-center pt-8 pb-16">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full font-semibold px-10"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        )}
      </section>

      {/* Lightbox */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
          {selected && (
            <>
              <DialogTitle className="sr-only">Gallery media</DialogTitle>
              <div className="rounded-xl overflow-hidden bg-black">
                {selected.mediaType === 'video' ? (
                  <video src={selected.url} controls autoPlay className="w-full max-h-[60vh]" />
                ) : (
                  <img src={selected.url} alt="" className="w-full max-h-[60vh] object-contain" />
                )}
              </div>
              <div className="space-y-3">
                {selected.caption && (
                  <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{selected.caption}</p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span className="uppercase tracking-wider">
                    {new Date(selected.postedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {selected.sourceUrl && (
                    <a
                      href={selected.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                    >
                      <Instagram className="h-3.5 w-3.5" />
                      View on Instagram
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
