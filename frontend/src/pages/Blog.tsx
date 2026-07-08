import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PenSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { blogService, Post } from '@/services/blog.service';
import PostCard from '@/components/PostCard';
import PostFormModal from '@/components/PostFormModal';
import { useAuth } from '@/context/AuthContext';

const LIMIT = 10;

export default function Blog() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPostsAvailable, setNewPostsAvailable] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPosts = useCallback(async (pageNum: number, replace = false) => {
    setLoading(true);
    try {
      const res = await blogService.getPosts(pageNum, LIMIT);
      setPosts((prev) => replace ? res.data : [...prev, ...res.data]);
      setTotal(res.total);
      setHasMore(pageNum * LIMIT < res.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(1, true); }, [fetchPosts]);

  // Poll every 30 s for new posts
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await blogService.getPosts(1, 1);
        if (res.data[0] && res.data[0].id !== posts[0]?.id) {
          setNewPostsAvailable(true);
        }
      } catch { /* silent */ }
    }, 30_000);
    return () => clearInterval(interval);
  }, [posts]);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const next = page + 1;
          setPage(next);
          fetchPosts(next);
        }
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, page, fetchPosts]);

  function onPostCreated(post: Post) {
    setPosts((prev) => [post, ...prev]);
    setTotal((t) => t + 1);
    setCreating(false);
  }

  function onPostUpdated(updated: Post) {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function onPostDeleted(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setTotal((t) => t - 1);
  }

  return (
    <div className="min-h-screen">
      {/* Editorial hero */}
      <section className="relative overflow-hidden -mt-[4.5rem] gradient-hero noise">
        <div className="container mx-auto px-4 relative z-10 pt-40 pb-14 md:pt-44 md:pb-16">
          <p className="section-label mb-6">Community feed</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h1 className="font-display font-black uppercase text-foreground leading-[0.9] tracking-tight text-6xl md:text-8xl">
              The<br />
              <span className="gradient-text">Blog</span>
            </h1>
            <div className="max-w-md">
              <p dir="rtl" className="font-display font-bold text-xl text-muted-foreground/70 mb-3">
                منصة أعضاء الأكاديمية
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ideas, updates, and takes from the members themselves,
                <span className="text-foreground font-semibold"> {total} posts</span> and counting.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 space-y-4 py-10">
        {/* Create post prompt */}
        {isAuthenticated && (
          <div
            className="bg-card rounded-2xl border border-border px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => setCreating(true)}
          >
            <Avatar className="w-9 h-9">
              <AvatarImage src={user?.photoUrl || undefined} />
              <AvatarFallback>{user?.displayName?.[0] ?? 'U'}</AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm text-muted-foreground bg-muted rounded-full px-4 py-2 select-none">
              What's on your mind, {user?.displayName?.split(' ')[0]}?
            </span>
            <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground">
              <PenSquare className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* New posts banner */}
        {newPostsAvailable && (
          <button
            onClick={() => { fetchPosts(1, true); setPage(1); setNewPostsAvailable(false); }}
            className="w-full gradient-primary text-white text-sm font-semibold py-2.5 rounded-full text-center hover:opacity-90 transition-opacity"
          >
            New posts available, click to refresh
          </button>
        )}

        {/* Posts feed */}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDeleted={onPostDeleted}
            onUpdated={onPostUpdated}
          />
        ))}

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* End of feed */}
        {!loading && !hasMore && posts.length > 0 && (
          <p className="text-center text-xs text-muted-foreground py-4">You've reached the end </p>
        )}

        {/* Empty state */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-base">No posts yet. Be the first to share something!</p>
            {isAuthenticated && (
              <Button className="mt-4 rounded-full gradient-primary" onClick={() => setCreating(true)}>
                <PenSquare className="w-4 h-4 mr-2" /> Create Post
              </Button>
            )}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />
      </div>

      {/* Create modal */}
      {creating && (
        <PostFormModal
          onClose={() => setCreating(false)}
          onSaved={onPostCreated}
        />
      )}
    </div>
  );
}
