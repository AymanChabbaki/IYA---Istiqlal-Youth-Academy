import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/Footer';
import { HeroParticles } from '@/components/HeroParticles';
import { Linkedin, Github, Twitter, Mail, Users } from 'lucide-react';
import { userService } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';

interface Member {
  id: string;
  displayName: string;
  role: 'ADMIN' | 'STAFF' | 'USER';
  staffRole?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  github?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  email: string;
  region?: string | null;
  city?: string | null;
  committee?: { id: string; name: string; nameAr?: string | null } | null;
  createdAt: string;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await userService.getPublicMembers();
      setMembers(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to fetch members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (photoUrl: string | null | undefined) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl;
    }
    const API_URL = import.meta.env.VITE_API_URL || 'https://istiqlalyouthacademy-backend.vercel.app/api';
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${photoUrl}`;
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const formatUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const leadership = members.filter(m => (m.role === 'ADMIN' || m.role === 'STAFF') && m.displayName !== 'Admin User');
  const community = members.filter(m => m.role === 'USER' && m.displayName !== 'Admin User');

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden -mt-[4.5rem] gradient-hero noise">
        <HeroParticles variant="section" id="hero-particles-members" />
        <div className="container mx-auto px-4 relative z-10 pt-40 pb-20 md:pt-48 md:pb-24">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-label mb-6"
          >
            Our people
          </motion.p>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-black uppercase text-foreground leading-[0.9] tracking-tight text-6xl md:text-8xl"
            >
              Voices of<br />
              <span className="gradient-text">the Academy</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="max-w-md"
            >
              <p dir="rtl" className="font-display font-bold text-xl text-muted-foreground/70 mb-3">
                وجوه الأكاديمية
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The next generation shaping Morocco's public life.
                Meet the people behind Istiqlal Youth Academy.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="container mx-auto px-4 py-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      ) : members.length === 0 ? (
        <div className="container mx-auto px-4 py-32 text-center">
          <Users className="w-14 h-14 mx-auto text-muted-foreground mb-6 opacity-40" />
          <h3 className="font-display font-black uppercase tracking-tight text-3xl mb-2">No members yet.</h3>
          <p className="text-muted-foreground">Public member profiles will appear here.</p>
        </div>
      ) : (
        <section className="container mx-auto px-4 py-20 md:py-28 space-y-24">
          {/* Leadership */}
          {leadership.length > 0 && (
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-14"
              >
                <p className="section-label mb-5">Leadership</p>
                <h2 className="font-display font-black uppercase tracking-tight leading-[0.95] text-4xl md:text-6xl">
                  The team.
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {leadership.map((member, i) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.08, 0.4) }}
                    className="group relative rounded-3xl border border-border bg-card p-8 flex flex-col items-center text-center hover:border-primary/40 hover:shadow-glow transition-all duration-300"
                  >
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-primary/25 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative w-32 h-32 rounded-full p-1 gradient-primary">
                        <div className="w-full h-full rounded-full bg-card p-1 overflow-hidden">
                          {member.photoUrl ? (
                            <img
                              src={getImageUrl(member.photoUrl) || ''}
                              alt={member.displayName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full flex items-center justify-center font-display text-3xl font-black bg-muted">
                              {getInitials(member.displayName)}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 gradient-primary text-white font-bold uppercase text-[10px] tracking-widest py-1 px-4 rounded-full">
                        {member.staffRole || member.role}
                      </Badge>
                    </div>

                    <h3 className="font-display font-extrabold text-2xl tracking-tight group-hover:text-primary transition-colors">
                      {member.displayName}
                    </h3>
                    {member.committee?.name && (
                      <p className="text-xs text-primary font-semibold uppercase tracking-widest mt-1">
                        {member.committee.name.replace(/ Committee$/i, '')}
                      </p>
                    )}

                    {member.bio && (
                      <p className="text-muted-foreground text-sm leading-relaxed mt-4 line-clamp-3">
                        {member.bio}
                      </p>
                    )}

                    <div className="mt-auto pt-6 flex gap-3">
                      {member.github && (
                        <a href={formatUrl(member.github)} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl border border-border hover:border-primary hover:text-primary transition-colors">
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={formatUrl(member.linkedin)} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl border border-border hover:border-primary hover:text-primary transition-colors">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {member.twitter && (
                        <a href={formatUrl(member.twitter)} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl border border-border hover:border-primary hover:text-primary transition-colors">
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      <a href={`mailto:${member.email}`} className="p-2.5 rounded-xl gradient-primary text-white hover:opacity-90 transition-opacity">
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Community */}
          {community.length > 0 && (
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-14"
              >
                <p className="section-label mb-5">Community</p>
                <h2 className="font-display font-black uppercase tracking-tight leading-[0.95] text-4xl md:text-6xl">
                  The members.
                </h2>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {community.map((member, i) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-border shrink-0">
                        {member.photoUrl ? (
                          <img
                            src={getImageUrl(member.photoUrl) || ''}
                            alt={member.displayName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center font-display font-black">
                            {getInitials(member.displayName)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-display font-bold truncate group-hover:text-primary transition-colors">
                          {member.displayName}
                        </h4>
                        <p className="text-[11px] text-muted-foreground truncate uppercase tracking-wider">
                          {member.committee?.name?.replace(/ Committee$/i, '') || member.city || 'Member'}
                        </p>
                      </div>
                    </div>

                    {member.bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {member.bio}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex gap-2.5">
                        {member.github && (
                          <a href={formatUrl(member.github)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {member.linkedin && (
                          <a href={formatUrl(member.linkedin)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <a href={`mailto:${member.email}`} className="text-xs font-bold uppercase tracking-wider text-primary group-hover:tracking-[0.2em] transition-all">
                        Connect
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Members;
