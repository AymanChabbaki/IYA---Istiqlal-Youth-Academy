import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { homeContentService } from '@/services/home-content.service';
import {
  Scale, Users, HeartHandshake, Megaphone, Sparkles,
  BookOpen, GraduationCap, MapPin, Landmark, Heart, Star, ArrowRight,
  Calendar
} from 'lucide-react';

const About = () => {
  const { isAuthenticated } = useAuth();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [stats, setStats] = useState({ totalEvents: 0, totalMembers: 0, activeProjects: 0 });

  useEffect(() => {
    homeContentService.getHomeContent()
      .then((data) => setStats({
        totalEvents: data.totalEvents || 0,
        totalMembers: data.totalMembers || 0,
        activeProjects: data.activeProjects || 0,
      }))
      .catch(() => {});
  }, []);

  const values = [
    {
      icon: Scale,
      title: 'Reflection',
      description: 'Thoughtful debate and civic education grounded in the values of the Istiqlal Party',
      color: 'from-primary to-accent',
    },
    {
      icon: Users,
      title: 'Inclusion',
      description: 'A welcoming space where every young Moroccan voice has a place at the table',
      color: 'from-secondary to-primary',
    },
    {
      icon: Megaphone,
      title: 'Advocacy',
      description: 'Giving youth a real, organized voice in public life and policy',
      color: 'from-accent to-secondary',
    },
    {
      icon: HeartHandshake,
      title: 'Solidarity',
      description: 'Building lasting bonds between young members across Morocco',
      color: 'from-primary to-secondary',
    },
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'Workshops & Debates',
      description: 'Regular sessions on civic, social, and political topics that matter to youth',
    },
    {
      icon: GraduationCap,
      title: 'Civic Education',
      description: 'Structured programs to build political and civic literacy from the ground up',
    },
    {
      icon: Megaphone,
      title: 'Advocacy Training',
      description: 'Practical skills to organize, speak up, and drive change',
    },
    {
      icon: MapPin,
      title: 'National Network',
      description: 'A growing presence connecting young members across Morocco',
    },
    {
      icon: HeartHandshake,
      title: 'Mentorship',
      description: 'Guidance from experienced members of the Istiqlal Party',
    },
    {
      icon: Landmark,
      title: 'Institutional Access',
      description: 'A direct link between youth and the party\'s institutions',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 md:py-40 overflow-hidden -mt-[4.5rem] pt-48 md:pt-56 gradient-hero noise">
        {/* Animated Background Elements */}
        <motion.div style={{ y: y1, opacity }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 opacity-20">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Scale className="h-32 w-32 text-foreground" />
            </motion.div>
          </div>
          <div className="absolute top-40 right-20 opacity-20">
            <motion.div
              animate={{ rotate: -360, y: [0, -20, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-24 w-24 text-foreground" />
            </motion.div>
          </div>
          <div className="absolute bottom-20 left-1/4 opacity-20">
            <motion.div
              animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              <Megaphone className="h-28 w-28 text-foreground" />
            </motion.div>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto -mt-20"
          >
            <motion.h1
              className="font-display font-black uppercase tracking-tight leading-[0.92] text-5xl sm:text-7xl md:text-8xl mb-6 text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Reflection.<br />Inclusion.
              <span className="block gradient-text">
                Advocacy.
              </span>
            </motion.h1>

            <motion.p
              dir="rtl"
              className="font-display font-bold text-xl md:text-2xl text-muted-foreground/70 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              التفكير · الإدماج · الترافع
            </motion.p>

            <motion.p
              className="text-lg md:text-xl mb-10 text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Istiqlal Youth Academy is the youth initiative of the Istiqlal Party in Morocco,
              a space for young people to learn, organize, and be heard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="rounded-full gradient-primary text-base font-bold px-8 py-6 shadow-glow hover:opacity-90 transition-opacity group">
                <Link to={isAuthenticated ? "/events" : "/register"}>
                  Join Us
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full text-base font-bold px-8 py-6 border-foreground/25 text-foreground hover:bg-foreground/10">
                <Link to="/events">Explore Events</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: 'Events Hosted', value: `${stats.totalEvents}+`, icon: Calendar },
              { label: 'Active Members', value: `${stats.totalMembers}+`, icon: Users },
              { label: 'Programs Run', value: `${stats.activeProjects}+`, icon: Star },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ y: -10, scale: 1.05 }}
              >
                <Card className="p-8 text-center shadow-card hover:shadow-glow transition-all">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-4"
                  >
                    <stat.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">
              <Heart className="h-3 w-3 mr-1" />
              Our Core Values
            </Badge>
            <h2 className="font-display font-black uppercase tracking-tight leading-[0.95] text-4xl md:text-6xl mb-4">What Drives Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do in our community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -15, scale: 1.02 }}
              >
                <Card className="p-8 shadow-card hover:shadow-glow transition-all h-full group relative overflow-hidden">
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  />
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} mb-6`}
                  >
                    <value.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">
              <Star className="h-3 w-3 mr-1" />
              What We Offer
            </Badge>
            <h2 className="font-display font-black uppercase tracking-tight leading-[0.95] text-4xl md:text-6xl mb-4">Programs & Support</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to grow as an engaged, informed young citizen
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="p-6 shadow-card hover:shadow-glow transition-all h-full">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-12 shadow-card relative overflow-hidden">
              <motion.div
                className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
              />
              <div className="relative z-10">
                <Badge className="mb-6">
                  <Heart className="h-3 w-3 mr-1" />
                  Our Story
                </Badge>
                <h2 className="font-display font-black uppercase tracking-tight text-3xl md:text-5xl mb-8">Who We Are</h2>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    Istiqlal Youth Academy (الأكاديمية الاستقلالية للشباب) is the youth initiative
                    of the Istiqlal Party in Morocco. We bring together young people around three
                    pillars: Reflection, Inclusion, and Advocacy.
                  </p>
                  <p>
                    We organize workshops, debates, and civic education programs that give young
                    Moroccans the tools to think critically, engage in public life, and make their
                    voices heard within the party and beyond.
                  </p>
                  <p>
                    Whether you're new to civic engagement or already active, there's a place for
                    you in our academy. Join us and be part of shaping Morocco's future.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-16 w-16 mx-auto mb-6" />
            </motion.div>
            <h2 className="font-display font-black uppercase tracking-tight leading-[0.95] text-4xl md:text-6xl mb-6">
              Ready to Join Us?
            </h2>
            <p className="text-xl mb-8 text-muted-foreground">
              Start your journey with us today and connect with young people shaping Morocco's future
            </p>
            <Button asChild size="lg" className="text-lg gradient-accent group">
              <Link to={isAuthenticated ? "/events" : "/register"}>
                Get Started Now
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

export default About;