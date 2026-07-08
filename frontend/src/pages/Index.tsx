import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { EventCard } from '@/components/EventCard';
import { Footer } from '@/components/Footer';
import { HeroParticles } from '@/components/HeroParticles';
import LeaderboardWidget from '@/components/LeaderboardWidget';
import {
  ArrowRight, ArrowUpRight, Calendar, Users, Scale, Megaphone,
  ThumbsUp, Podcast as PodcastIcon, Plus, PlayCircle
} from 'lucide-react';
import { eventService } from '@/services/event.service';
import { homeContentService, HomeContent } from '@/services/home-content.service';
import { podcastService, PodcastSubject } from '@/services/podcast.service';
import { committeeService, Committee } from '@/services/committee.service';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';

const RIBBON_WORDS = ['Reflection', 'التفكير', 'Inclusion', 'الإدماج', 'Advocacy', 'الترافع'];

const PILLARS = [
  {
    index: '01',
    icon: Scale,
    title: 'Reflection',
    titleAr: 'التفكير',
    description: 'Thoughtful debate and civic education grounded in the values of the Istiqlal Party.',
  },
  {
    index: '02',
    icon: Users,
    title: 'Inclusion',
    titleAr: 'الإدماج',
    description: 'A welcoming space where every young Moroccan voice has a place at the table.',
  },
  {
    index: '03',
    icon: Megaphone,
    title: 'Advocacy',
    titleAr: 'الترافع',
    description: 'Giving youth a real, organized voice in public life and policy.',
  },
];

interface HeroMedia {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  mediaType: string;
}

/** Mouse-tracked 3D card stack for the hero: fans out the latest gallery shots in perspective. */
const Hero3D = ({ items }: { items: HeroMedia[] }) => {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 100, damping: 18 });
  const sy = useSpring(my, { stiffness: 100, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-16, 16]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [12, -12]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const cards = items.slice(0, 3);
  if (cards.length < 3) return null;

  const src = (m: HeroMedia) => (m.mediaType === 'video' ? m.thumbnailUrl || m.url : m.url);

  return (
    <div
      className="relative hidden lg:flex items-center justify-center [perspective:1400px] select-none"
      onMouseMove={onMove}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
    >
      {/* Rotating conic glow ring */}
      <div
        aria-hidden
        className="absolute w-[34rem] h-[34rem] rounded-full opacity-50 blur-3xl animate-[spin_16s_linear_infinite]"
        style={{ background: 'conic-gradient(from 0deg, transparent 0%, hsl(var(--primary) / 0.55) 25%, transparent 55%, hsl(300 70% 45% / 0.4) 80%, transparent 100%)' }}
      />

      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative w-[26rem] h-[30rem]"
      >
        {/* Back card */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 right-0 w-60 h-72 rounded-3xl overflow-hidden border border-foreground/10 shadow-card rotate-6"
          style={{ transform: 'translateZ(-90px) rotate(6deg)' }}
        >
          <img src={src(cards[1])} alt="" className="h-full w-full object-cover opacity-70" loading="lazy" />
        </motion.div>

        {/* Middle card */}
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className="absolute top-14 left-0 w-60 h-72 rounded-3xl overflow-hidden border border-foreground/10 shadow-card"
          style={{ transform: 'translateZ(-20px) rotate(-7deg)' }}
        >
          <img src={src(cards[2])} alt="" className="h-full w-full object-cover opacity-85" loading="lazy" />
        </motion.div>

        {/* Front card */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="absolute top-24 left-1/2 -ml-32 w-72 h-80 rounded-3xl overflow-hidden border border-primary/30 shadow-glow"
          style={{ transform: 'translateZ(90px) rotate(2deg)' }}
        >
          <img src={src(cards[0])} alt="" className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {cards[0].mediaType === 'video' && (
            <span className="absolute top-4 right-4 rounded-full bg-black/50 backdrop-blur p-2 text-white">
              <PlayCircle className="h-5 w-5" />
            </span>
          )}
        </motion.div>

        {/* Floating brand chip */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-2 -left-6 glass-card rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-glow"
          style={{ transform: 'translateZ(150px)' }}
        >
          <img src="/logo.png" alt="" className="h-10 w-10 object-contain dark:hidden" />
          <img src="/logo-white.png" alt="" className="h-10 w-10 object-contain hidden dark:block" />
          <div className="leading-tight">
            <p className="text-xs font-bold uppercase tracking-widest">@istiqlalyouthacademy</p>
            <p className="text-[11px] text-muted-foreground">Reflection · Inclusion · Advocacy</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

const Index = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [podcastSubjects, setPodcastSubjects] = useState<PodcastSubject[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [voting, setVoting] = useState<Set<string>>(new Set());
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [newSubjectDescription, setNewSubjectDescription] = useState('');
  const [showNewSubjectForm, setShowNewSubjectForm] = useState(false);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [homeContent, setHomeContent] = useState<Partial<HomeContent>>({
    heroTitle: 'Istiqlal Youth Academy',
    heroSubtitle: 'Reflection, Inclusion, Advocacy: the youth initiative of the Istiqlal Party in Morocco',
    heroCtaText: 'Join Us',
    heroCtaLink: '/register',
    showPastEvents: true,
    statsEnabled: true,
    totalEvents: 0,
    totalMembers: 0,
    activeProjects: 0,
    featuredEventIds: []
  });
  const [galleryPreview, setGalleryPreview] = useState<Array<{ id: string; url: string; thumbnailUrl: string | null; mediaType: string; caption?: string | null }>>([]);

  useEffect(() => {
    fetchData();
    fetchPodcastSubjects();
    api.get('/gallery', { params: { limit: 12 } })
      .then((res) => setGalleryPreview(res.data.items || []))
      .catch(() => {});
    committeeService.getCommittees().then(setCommittees).catch(() => {});
  }, []);

  // Re-fetch podcast subjects (including user votes) when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchPodcastSubjects();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [contentData, eventsResponse] = await Promise.all([
        homeContentService.getHomeContent(),
        eventService.getAllEvents()
      ]);

      setHomeContent(contentData);
      const events = eventsResponse.data || [];

      // Map events to EventCard format
      const mappedEvents = events.map((event: any) => ({
        ...event,
        date: event.startAt,
        location: event.locationText,
        image: event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        registrations: event._count?.registrations || 0
      }));

      const now = new Date();
      const upcoming = mappedEvents.filter((event: any) =>
        new Date(event.startAt) > now
      ).slice(0, 3);

      const past = mappedEvents.filter((event: any) =>
        new Date(event.endAt) < now && event.imageUrl
      ).slice(0, 6);

      setUpcomingEvents(upcoming);
      setPastEvents(past);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchPodcastSubjects = async () => {
    try {
      // Do not pass a comma-separated status string; backend uses default to show approved and pending when no status provided
      const subjects = await podcastService.getAllPodcastSubjects();
      setPodcastSubjects(subjects.sort((a: PodcastSubject, b: PodcastSubject) => b.votes - a.votes).slice(0, 6));

      // Fetch user votes if authenticated (do it in parallel)
      if (isAuthenticated) {
        try {
          const votePromises = subjects.map((subject: PodcastSubject) =>
            podcastService
              .getUserVoteForSubject(subject.id)
              .then((r) => !!r.hasVoted)
              .catch(() => false)
          );

          const voteResults = await Promise.all(votePromises);
          const votes = new Set<string>();
          subjects.forEach((subject: PodcastSubject, idx: number) => {
            if (voteResults[idx]) votes.add(subject.id);
          });
          setUserVotes(votes);
        } catch (err) {
          // If fetching user votes fails, keep existing local votes
          console.warn('Could not fetch user votes:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching podcast subjects:', error);
    }
  };

  const handleVote = async (subjectId: string) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    // Prevent duplicate clicks while voting
    if (voting.has(subjectId)) return;

    setVoting((s) => new Set(s).add(subjectId));

    try {
      const hasVoted = userVotes.has(subjectId);

      if (hasVoted) {
        await podcastService.unvoteForPodcastSubject(subjectId);
        setUserVotes((prev) => {
          const newVotes = new Set(prev);
          newVotes.delete(subjectId);
          return newVotes;
        });
        toast({ title: 'Vote removed', description: 'You unliked this topic.' });
      } else {
        await podcastService.voteForPodcastSubject(subjectId);
        setUserVotes((prev) => new Set(prev).add(subjectId));
        toast({ title: 'Voted', description: 'Thanks, your vote was recorded.' });
      }

      // Refresh subjects to get updated vote counts
      fetchPodcastSubjects();
    } catch (error: any) {
      // Show a toast instead of console spam
      toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to register vote', variant: 'destructive' });
    } finally {
      setVoting((s) => {
        const newSet = new Set(s);
        newSet.delete(subjectId);
        return newSet;
      });
    }
  };

  const handleSubmitSubject = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (!newSubjectTitle.trim()) {
      return;
    }

    try {
      await podcastService.createPodcastSubject({
        title: newSubjectTitle,
        description: newSubjectDescription
      });

      setNewSubjectTitle('');
      setNewSubjectDescription('');
      setShowNewSubjectForm(false);
      fetchPodcastSubjects();
    } catch (error) {
      console.error('Error submitting subject:', error);
    }
  };

  const heroWords = (homeContent.heroTitle || 'Istiqlal Youth Academy').split(' ');
  const heroLead = heroWords.slice(0, -1).join(' ');
  const heroLast = heroWords[heroWords.length - 1];

  const stats = [
    { value: homeContent.totalMembers ?? 0, label: 'Members' },
    { value: homeContent.totalEvents ?? 0, label: 'Events' },
    { value: homeContent.activeProjects ?? 0, label: 'Programs' },
  ];

  return (
    <div className="min-h-screen">
      <HeroParticles />
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden -mt-[4.5rem] gradient-hero noise">
        <HeroParticles variant="section" id="hero-particles-top" />
        <div className="container mx-auto px-4 relative z-10 pt-36 md:pt-44 pb-16">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
          <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display font-black uppercase text-foreground leading-[0.92] tracking-tight text-5xl sm:text-6xl xl:text-7xl"
          >
            {heroLead}{' '}
            <span className="gradient-text">{heroLast}</span>
          </motion.h1>

          <motion.p
            dir="rtl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="font-display font-bold text-2xl md:text-3xl text-muted-foreground/70 mt-6 text-right sm:text-left"
          >
            الأكاديمية الاستقلالية للشباب
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mt-6 leading-relaxed"
          >
            {homeContent.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 mt-10"
          >
            <Button asChild size="lg" className="rounded-full gradient-primary text-base font-bold px-8 h-13 py-6 shadow-glow hover:opacity-90 transition-opacity group">
              <Link to={isAuthenticated ? '/events' : (homeContent.heroCtaLink || '/register')}>
                {homeContent.heroCtaText || 'Join Us'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full text-base font-bold px-8 py-6 border-foreground/25 text-foreground hover:bg-foreground/10">
              <Link to="/events">{t.hero.learnMore}</Link>
            </Button>
          </motion.div>

          {homeContent.statsEnabled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-16 pt-8 border-t border-foreground/10 grid grid-cols-3 gap-8 max-w-xl"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display font-black text-4xl md:text-5xl text-foreground">
                    {stat.value}<span className="text-primary">+</span>
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
          </div>

          <Hero3D items={galleryPreview} />
          </div>
        </div>

        {/* Live gallery marquee */}
        {galleryPreview.length > 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="relative z-10 pb-16 overflow-hidden marquee-paused"
          >
            <div className="flex gap-5 w-max animate-marquee pl-5">
              {[...galleryPreview, ...galleryPreview].map((item, i) => (
                <Link
                  to="/gallery"
                  key={`${item.id}-${i}`}
                  className="relative block h-40 md:h-48 w-64 md:w-72 shrink-0 overflow-hidden rounded-2xl border border-foreground/10 group"
                >
                  <img
                    src={item.mediaType === 'video' ? item.thumbnailUrl || item.url : item.url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  {item.mediaType === 'video' && (
                    <PlayCircle className="absolute top-3 right-3 h-5 w-5 text-white/90" />
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </section>

      {/* ── Values ribbon ────────────────────────────────────────────── */}
      <div className="border-y border-border bg-background py-5 overflow-hidden" aria-hidden>
        <div className="flex w-max animate-marquee-slow items-center gap-12">
          {[...RIBBON_WORDS, ...RIBBON_WORDS, ...RIBBON_WORDS, ...RIBBON_WORDS].map((word, i) => (
            <span key={i} className="flex items-center gap-12 font-display font-black uppercase tracking-tight text-2xl md:text-4xl whitespace-nowrap">
              <span className={i % 2 === 1 ? 'text-outline' : 'text-foreground'}>{word}</span>
              <span className="text-primary text-xl">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Pillars ──────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 max-w-3xl"
          >
            <p className="section-label mb-5">Who we are</p>
            <h2 className="font-display font-black uppercase tracking-tight leading-[0.95] text-4xl md:text-6xl">
              Three pillars.<br />
              <span className="gradient-text">One movement.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 rounded-3xl border border-border overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border">
            {PILLARS.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="group relative p-10 lg:p-12 bg-card hover:bg-muted/60 transition-colors duration-300"
              >
                <span className="font-display font-black text-7xl lg:text-8xl text-outline group-hover:[-webkit-text-stroke-color:hsl(var(--primary))] transition-all duration-300 select-none">
                  {pillar.index}
                </span>
                <div className="mt-8 flex items-center justify-between">
                  <h3 className="font-display font-extrabold uppercase tracking-tight text-2xl">
                    {pillar.title}
                  </h3>
                  <pillar.icon className="h-6 w-6 text-primary opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                </div>
                <p dir="rtl" className="font-display font-bold text-lg text-muted-foreground/70 mt-1 text-left">
                  {pillar.titleAr}
                </p>
                <p className="text-muted-foreground mt-4 leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gallery bento ────────────────────────────────────────────── */}
      {galleryPreview.length > 0 && (
        <section className="py-24 md:py-32 border-t border-border">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14"
            >
              <div>
                <p className="section-label mb-5">On the ground</p>
                <h2 className="font-display font-black uppercase tracking-tight leading-[0.95] text-4xl md:text-6xl">
                  Moments<br />in motion.
                </h2>
              </div>
              <Button asChild variant="outline" className="rounded-full font-semibold self-start md:self-auto group">
                <Link to="/gallery">
                  Full gallery
                  <ArrowUpRight className="ml-1.5 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </Button>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[200px] gap-4">
              {galleryPreview.slice(0, 7).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className={index === 0 ? 'col-span-2 row-span-2' : ''}
                >
                  <Link
                    to="/gallery"
                    className="relative block h-full w-full overflow-hidden rounded-2xl border border-border group"
                  >
                    <img
                      src={item.mediaType === 'video' ? item.thumbnailUrl || item.url : item.url}
                      alt={item.caption?.slice(0, 60) || 'Istiqlal Youth Academy'}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
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
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Committees ───────────────────────────────────────────────── */}
      {committees.length > 0 && (
        <section className="py-24 md:py-32 border-t border-border bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-14 max-w-3xl"
            >
              <p className="section-label mb-5">Get involved</p>
              <h2 className="font-display font-black uppercase tracking-tight leading-[0.95] text-4xl md:text-6xl">
                {committees.length} committees.<br />
                <span className="gradient-text">Find your fight.</span>
              </h2>
              <p className="text-muted-foreground text-lg mt-6 max-w-xl">
                Every member joins a thematic committee, from economic policy to
                mental health, and works on real proposals, not just talk.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-wrap gap-3"
            >
              {committees.map((committee, index) => (
                <motion.div
                  key={committee.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index * 0.03, 0.5) }}
                >
                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary hover:shadow-glow transition-all duration-300"
                  >
                    {committee.name.replace(/ Committee$/i, '')}
                    {committee.nameAr && (
                      <span dir="rtl" className="text-muted-foreground/60 group-hover:text-primary/60 transition-colors font-display">
                        {committee.nameAr.replace(/^لجنة /, '')}
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Upcoming events ──────────────────────────────────────────── */}
      <section className="py-24 md:py-32 border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14"
          >
            <div>
              <p className="section-label mb-5">Programme</p>
              <h2 className="font-display font-black uppercase tracking-tight leading-[0.95] text-4xl md:text-6xl">
                What's<br />next.
              </h2>
            </div>
            <Button asChild variant="outline" className="rounded-full font-semibold self-start md:self-auto group">
              <Link to="/events">
                All events
                <ArrowUpRight className="ml-1.5 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          {upcomingEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EventCard {...event} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-16 text-center">
              <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="font-display font-bold text-xl mb-1">Nothing scheduled yet.</p>
              <p className="text-muted-foreground">New events land here first. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Leaderboard ──────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <LeaderboardWidget />
          </motion.div>
        </div>
      </section>

      {/* ── Podcast topic voting ─────────────────────────────────────── */}
      <section id="podcast-topics" className="py-24 md:py-32 border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 max-w-3xl"
          >
            <p className="section-label mb-5">Community input</p>
            <h2 className="font-display font-black uppercase tracking-tight leading-[0.95] text-4xl md:text-6xl">
              You pick the<br />
              <span className="gradient-text">conversation.</span>
            </h2>
            <p className="text-muted-foreground text-lg mt-6 max-w-xl">
              Vote for the topics you want covered in our next podcast episode, or pitch your own.
            </p>
          </motion.div>

          <div className="max-w-4xl">
            <div className="grid gap-4 mb-6">
              {podcastSubjects.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border p-12 text-center">
                  <PodcastIcon className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No podcast topics yet. Be the first to suggest one!</p>
                </div>
              ) : (
                podcastSubjects.map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="group flex items-start gap-5 rounded-2xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
                      <Button
                        variant={userVotes.has(subject.id) ? 'default' : 'outline'}
                        size="sm"
                        className={`flex-col h-auto py-2.5 px-4 min-w-[64px] rounded-xl ${userVotes.has(subject.id) ? 'gradient-primary' : ''}`}
                        onClick={() => handleVote(subject.id)}
                      >
                        <ThumbsUp className={`h-5 w-5 mb-1 ${userVotes.has(subject.id) ? 'fill-current' : ''}`} />
                        <span className="text-lg font-bold">{subject.votes}</span>
                      </Button>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-xl group-hover:text-primary transition-colors">
                          {subject.title}
                        </h3>
                        {subject.description && (
                          <p className="text-muted-foreground mt-1 line-clamp-2">{subject.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-3 uppercase tracking-wider">
                          {subject.status} · {new Date(subject.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Submit New Subject Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8"
            >
              {!showNewSubjectForm ? (
                <Button
                  onClick={() => setShowNewSubjectForm(true)}
                  size="lg"
                  variant="outline"
                  className="w-full border-dashed border-2 h-auto py-6 rounded-2xl hover:border-primary hover:bg-primary/5 font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Suggest Your Own Podcast Topic
                </Button>
              ) : (
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="font-display">Suggest a Podcast Topic</CardTitle>
                    <CardDescription>
                      Share your idea for a podcast episode. Our team will review it before it appears for voting.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Topic Title *</label>
                      <Input
                        placeholder="e.g., Youth participation in local government"
                        value={newSubjectTitle}
                        onChange={(e) => setNewSubjectTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                      <textarea
                        className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                        placeholder="Tell us more about what you'd like us to discuss..."
                        value={newSubjectDescription}
                        onChange={(e) => setNewSubjectDescription(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button onClick={handleSubmitSubject} disabled={!newSubjectTitle.trim()} className="rounded-full">
                      Submit Idea
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => {
                      setShowNewSubjectForm(false);
                      setNewSubjectTitle('');
                      setNewSubjectDescription('');
                    }}>
                      Cancel
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Past events ──────────────────────────────────────────────── */}
      {pastEvents.length > 0 && (
        <section className="py-24 md:py-32 border-t border-border bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14"
            >
              <div>
                <p className="section-label mb-5">Archive</p>
                <h2 className="font-display font-black uppercase tracking-tight leading-[0.95] text-4xl md:text-6xl">
                  Where we've<br />been.
                </h2>
              </div>
              <Button asChild variant="outline" className="rounded-full font-semibold self-start md:self-auto group">
                <Link to="/past-events">
                  All past events
                  <ArrowUpRight className="ml-1.5 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </Button>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <div className="relative h-64 overflow-hidden rounded-2xl border border-border group cursor-pointer">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <h3 className="text-white font-display font-bold text-lg mb-1">{event.title}</h3>
                      <p className="text-white/70 text-sm line-clamp-2">{event.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden gradient-hero noise py-28 md:py-36">
        <HeroParticles variant="section" id="hero-particles-cta" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <p className="section-label justify-center mb-6">Your move</p>
            <h2 className="font-display font-black uppercase tracking-tight leading-[0.95] text-foreground text-4xl md:text-7xl mb-6">
              Ready to show up<br />
              <span className="gradient-text">for Morocco?</span>
            </h2>
            <p dir="rtl" className="font-display font-bold text-xl md:text-2xl text-muted-foreground/70 mb-10">
              جيل جديد، صوت جديد
            </p>
            <Button asChild size="lg" className="rounded-full gradient-primary text-base font-bold px-10 py-7 shadow-glow hover:opacity-90 transition-opacity group">
              <Link to={isAuthenticated ? '/events' : '/register'}>
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
