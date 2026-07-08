import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { HeroParticles } from '@/components/HeroParticles';
import { UserPlus, ArrowRight, Scale, Megaphone, HeartHandshake, Users, Eye, EyeOff } from 'lucide-react';
import { homeContentService } from '@/services/home-content.service';
import { committeeService, Committee } from '@/services/committee.service';
import { MOROCCO_REGIONS } from '@/data/moroccoRegions';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [studyLevel, setStudyLevel] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [region, setRegion] = useState('');
  const [iqlim, setIqlim] = useState('');
  const [city, setCity] = useState('');
  const [committeeId, setCommitteeId] = useState('');
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalEvents: 0, totalMembers: 0, activeProjects: 0 });
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    committeeService.getCommittees().then(setCommittees).catch(() => {});
    homeContentService.getHomeContent()
      .then((data) => setStats({
        totalEvents: data.totalEvents || 0,
        totalMembers: data.totalMembers || 0,
        activeProjects: data.activeProjects || 0,
      }))
      .catch(() => {});
  }, []);

  const studyProgramsByLevel = {
    BACHELOR: [
      { value: 'BACHELOR_S1', label: 'Semester 1' },
      { value: 'BACHELOR_S2', label: 'Semester 2' },
      { value: 'BACHELOR_S3', label: 'Semester 3' },
      { value: 'BACHELOR_S4', label: 'Semester 4' },
      { value: 'BACHELOR_S5', label: 'Semester 5' },
      { value: 'BACHELOR_S6', label: 'Semester 6' }
    ],
    MASTER: [
      { value: 'MASTER_M1', label: 'Master 1' },
      { value: 'MASTER_M2', label: 'Master 2' }
    ],
    DOCTORATE: [
      { value: 'DOCTORATE_Y1', label: 'Year 1' },
      { value: 'DOCTORATE_Y2', label: 'Year 2' },
      { value: 'DOCTORATE_Y3', label: 'Year 3' },
      { value: 'DOCTORATE_Y4', label: 'Year 4' }
    ]
  };

  const handleStudyLevelChange = (value: string) => {
    setStudyLevel(value);
    setStudyProgram(''); // Reset program when level changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await register(name, email, password, {
        studyLevel,
        studyProgram,
        region,
        iqlim,
        city,
        committeeId,
      });
      if (success) {
        toast.success(t.auth.registerSuccess);

        // Store that user needs to complete the form
        localStorage.setItem('needsOnboarding', 'true');

        // Navigate to dashboard where the onboarding modal will show
        navigate('/dashboard');
      } else {
        toast.error('User already exists');
      }
    } catch (error) {
      toast.error(t.auth.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Visual Content */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative hidden lg:flex items-center justify-center p-12 gradient-hero overflow-hidden"
      >
        <HeroParticles variant="section" id="hero-particles-register" />
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 right-20 opacity-20"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Scale className="h-32 w-32 text-foreground" />
          </motion.div>
          <motion.div
            className="absolute bottom-32 left-20 opacity-20"
            animate={{ rotate: -360, y: [0, -20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          >
            <Megaphone className="h-24 w-24 text-foreground" />
          </motion.div>
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <HeartHandshake className="h-64 w-64 text-foreground" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg text-foreground space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Badge className="mb-6 bg-foreground/10 text-foreground border-foreground/20 text-base px-4 py-2 hover:bg-foreground/10">
              <Scale className="h-4 w-4 mr-2" />
              Start Your Journey
            </Badge>
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Build Your Future in
              <span className="block gradient-text">
                Civic Engagement
              </span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Access exclusive workshops, join a thematic committee, and become part of a growing youth movement.
            </p>
          </motion.div>

          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            {[
              { icon: Scale, text: 'Access to exclusive civic workshops' },
              { icon: Users, text: 'Join one of 19 thematic committees' },
              { icon: Megaphone, text: 'Real advocacy and leadership opportunities' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-4 bg-foreground/5 border border-border backdrop-blur-sm rounded-xl p-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-foreground/90">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-3 gap-6 pt-8 border-t border-foreground/10"
          >
            {[
              { value: `${stats.totalMembers}+`, label: 'Members' },
              { value: `${stats.totalEvents}+`, label: 'Events' },
              { value: `${stats.activeProjects}+`, label: 'Programs' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-display text-3xl font-black text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Register Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center p-8 bg-background"
      >
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary mb-6 shadow-lg"
            >
              <UserPlus className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground text-lg">
              Start your journey with Istiqlal Youth Academy
            </p>
          </div>

          {/* Register Form */}
          <Card className="p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">{t.auth.name}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Mohammed Salahi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">{t.auth.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">{t.auth.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="committee" className="text-base">Committee</Label>
                <Select value={committeeId} onValueChange={setCommitteeId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Which committee interests you?" />
                  </SelectTrigger>
                  <SelectContent>
                    {committees.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}{c.nameAr ? ` (${c.nameAr})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region" className="text-base">Region</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOROCCO_REGIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iqlim" className="text-base">Iqlim / Province</Label>
                  <Input
                    id="iqlim"
                    type="text"
                    placeholder="e.g. Ben M'sik"
                    value={iqlim}
                    onChange={(e) => setIqlim(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-base">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="e.g. Casablanca"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studyLevel" className="text-base">Study Level</Label>
                <Select value={studyLevel} onValueChange={handleStudyLevelChange}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your study level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACHELOR">Bachelor</SelectItem>
                    <SelectItem value="MASTER">Master</SelectItem>
                    <SelectItem value="DOCTORATE">Doctorate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {studyLevel && (
                <div className="space-y-2">
                  <Label htmlFor="studyProgram" className="text-base">Study Program</Label>
                  <Select value={studyProgram} onValueChange={setStudyProgram}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your program/year" />
                    </SelectTrigger>
                    <SelectContent>
                      {studyProgramsByLevel[studyLevel as keyof typeof studyProgramsByLevel]?.map((program) => (
                        <SelectItem key={program.value} value={program.value}>
                          {program.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                className="w-full gradient-primary h-12 text-base group"
                disabled={loading}
              >
                {loading ? t.common.loading : t.auth.register}
                {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {t.auth.hasAccount}{' '}
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  {t.auth.login}
                </Link>
              </p>
            </div>

            {/* Terms Notice */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-xs text-center text-muted-foreground">
              By registering, you agree to our Terms of Service and Privacy Policy
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
