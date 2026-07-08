import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { podcastService, Podcast } from '@/services/podcast.service';
import { 
  Play, Eye, Calendar, ExternalLink, MessageSquare, 
  Podcast as PodcastIcon, Sparkles, TrendingUp, Users,
  Code2, Brain, Rocket, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Podcasts = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const data = await podcastService.getAllPodcasts({ status: 'published' });
      setPodcasts(data);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPodcasts = podcasts.filter((podcast) =>
    podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    podcast.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const stats = [
    { label: 'Total Podcasts', value: podcasts.length, icon: PodcastIcon },
    { label: 'Total Views', value: podcasts.reduce((acc, p) => acc + p.views, 0), icon: Eye },
    { label: 'This Month', value: podcasts.filter(p => new Date(p.publishedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden -mt-[4.5rem] gradient-hero noise">
        <div className="container mx-auto px-4 relative z-10 pt-40 pb-16 md:pt-48 md:pb-20">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-label mb-6"
          >
            Listen &amp; watch
          </motion.p>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-black uppercase text-foreground leading-[0.9] tracking-tight text-6xl md:text-8xl"
            >
              The<br />
              <span className="gradient-text">Podcast</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="max-w-md"
            >
              <p dir="rtl" className="font-display font-bold text-xl text-muted-foreground/70 mb-3">
                حوارات شبابية بلا مجاملة
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Frank conversations on politics, society, and youth life in Morocco,
                and you vote on what we cover next.
              </p>
            </motion.div>
          </div>

          {/* Inline stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 pt-8 border-t border-foreground/10 grid grid-cols-3 gap-8 max-w-xl"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-display font-black text-3xl md:text-4xl text-foreground">
                  {stat.value}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-5 sticky top-[4.5rem] z-20 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Input
                type="text"
                placeholder="Search podcasts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-full"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Badge variant="outline" className="text-sm rounded-full px-4 py-1.5">
              {filteredPodcasts.length} {filteredPodcasts.length === 1 ? 'Episode' : 'Episodes'}
            </Badge>
          </div>
        </div>
      </section>

      {/* Podcasts Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardHeader>
                    <div className="h-6 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPodcasts.length === 0 ? (
            <div className="text-center py-20">
              <img src="/Podcast.png" alt="No podcasts" className="mx-auto mb-6 w-48 h-48 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain" />
              <h3 className="text-2xl font-semibold mb-2">No Podcasts Yet</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? 'No podcasts match your search. Try different keywords.'
                  : 'Stay tuned, our first episode is coming soon!'}
              </p>
              {!searchTerm && (
                <p className="text-sm text-muted-foreground">Follow us and check back later for the launch.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPodcasts.map((podcast, index) => (
                <motion.div
                  key={podcast.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden h-full flex flex-col">
                    {/* Thumbnail Image (Always show if available) */}
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      {podcast.thumbnailUrl ? (
                        <img 
                          src={podcast.thumbnailUrl} 
                          alt={podcast.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                          <PodcastIcon className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <CardHeader className="flex-grow">
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                        {podcast.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {podcast.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{podcast.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(podcast.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {podcast.youtubeUrl && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex-1"
                            asChild
                          >
                            <a href={podcast.youtubeUrl} target="_blank" rel="noopener noreferrer">
                              <Play className="h-4 w-4 mr-1" />
                              Watch
                            </a>
                          </Button>
                        )}
                        {podcast.discordLink && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            asChild
                          >
                            <a href={podcast.discordLink} target="_blank" rel="noopener noreferrer">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Discuss
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Want to suggest a podcast topic?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Head over to our home page to vote on existing topics or submit your own ideas!
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              asChild
              className="group"
            >
              <Link to="/">
                Vote for Topics
                <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Podcasts;
