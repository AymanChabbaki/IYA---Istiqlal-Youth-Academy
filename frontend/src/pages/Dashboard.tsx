import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Calendar, Vote, FileText, Award, Loader2 } from 'lucide-react';
import { HeroParticles } from '@/components/HeroParticles';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { eventService } from '@/services/event.service';
import { pollService } from '@/services/poll.service';
import { formService } from '@/services/form.service';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [myVotes, setMyVotes] = useState<any[]>([]);
  const [myForms, setMyForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's event registrations
      const registrationsRes = await eventService.getMyRegistrations();
      setMyEvents(registrationsRes.data || []);

      // Fetch user's poll votes
      const votesRes = await pollService.getMyVotes();
      setMyVotes(votesRes.data || []);

      // Fetch user's form submissions
      const formsRes = await formService.getUserSubmissions();
      setMyForms(formsRes.data || []);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: Calendar,
      label: 'Events Registered',
      value: myEvents.length,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Vote,
      label: 'Polls Voted',
      value: myVotes.length,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      icon: FileText,
      label: 'Forms Submitted',
      value: myForms.length,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      icon: Award,
      label: 'Badges Earned',
      value: myEvents.length,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Editorial header */}
      <section className="relative overflow-hidden -mt-[4.5rem] gradient-hero noise">
        <HeroParticles variant="section" id="hero-particles-dashboard" />
        <div className="container mx-auto px-4 relative z-10 pt-36 pb-14 md:pt-44 md:pb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-label mb-5"
          >
            Your space
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-black uppercase tracking-tight leading-[0.95] text-4xl md:text-6xl text-foreground mb-3"
          >
            Welcome,<br />
            <span className="gradient-text">{user?.displayName}.</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-2"
          >
            <p className="text-muted-foreground mr-2">Here's your activity overview</p>
            {user?.committee?.name && (
              <span className="rounded-full border border-primary/40 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                {user.committee.name.replace(/ Committee$/i, '')}
              </span>
            )}
            {user?.city && (
              <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {user.city}
              </span>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className="p-6 rounded-2xl border-border hover:border-primary/40 hover:shadow-glow transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl gradient-primary text-white">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-3xl font-black leading-none">{stat.value}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1.5">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* My Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 md:p-8 rounded-2xl shadow-card mb-8">
            <h2 className="font-display font-black uppercase tracking-tight text-2xl md:text-3xl mb-6">{t.dashboard.myEvents}</h2>
            {myEvents.length > 0 ? (
              <div className="space-y-4">
                {myEvents.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/40 hover:border-primary/40 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold">{registration.event?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {registration.event?.locationText} • {new Date(registration.event?.startAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Registered: {new Date(registration.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/events/${registration.eventId}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 rounded-xl border border-dashed border-border">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground mb-4">No events registered yet</p>
                <Button asChild className="rounded-full gradient-primary font-semibold px-6">
                  <Link to="/events">Browse Events</Link>
                </Button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 md:p-8 rounded-2xl shadow-card">
            <h2 className="font-display font-black uppercase tracking-tight text-2xl md:text-3xl mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { to: '/my-registrations', icon: Calendar, title: 'My Registrations', sub: `${myEvents.length} events` },
                { to: '/events', icon: Calendar, title: 'Browse Events', sub: 'Discover new' },
                { to: '/polls', icon: Vote, title: 'Vote on Polls', sub: `${myVotes.length} voted` },
                { to: '/profile', icon: Award, title: 'Edit Profile', sub: 'Update info' },
              ].map((action) => (
                <Link
                  key={action.title}
                  to={action.to}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-border py-6 px-3 text-center hover:border-primary/50 hover:shadow-glow transition-all"
                >
                  <action.icon className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-display font-bold text-sm md:text-base">{action.title}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{action.sub}</span>
                </Link>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;