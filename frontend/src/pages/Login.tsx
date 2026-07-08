import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { LogIn, Sparkles, Scale, Users, Megaphone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { HeroParticles } from '@/components/HeroParticles';
import { homeContentService } from '@/services/home-content.service';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalEvents: 0, totalMembers: 0, activeProjects: 0 });
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    homeContentService.getHomeContent()
      .then((data) => setStats({
        totalEvents: data.totalEvents || 0,
        totalMembers: data.totalMembers || 0,
        activeProjects: data.activeProjects || 0,
      }))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success(t.auth.loginSuccess);
        
        // Redirect based on user role
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else if (user.role === 'STAFF') {
            navigate('/staff/dashboard');
          } else {
            navigate('/dashboard');
          }
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(t.auth.error);
      }
    } catch (error) {
      toast.error(t.auth.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
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
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-6 shadow-lg"
            >
              <LogIn className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground text-lg">
              Sign in to continue your journey
            </p>
          </div>

          {/* Login Form */}
          <Card className="p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base">{t.auth.password}</Label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-accent h-12 text-base group" 
                disabled={loading}
              >
                {loading ? t.common.loading : t.auth.login}
                {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {t.auth.noAccount}{' '}
                <Link to="/register" className="text-primary hover:underline font-semibold">
                  {t.auth.register}
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Right Side - Visual Content */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative hidden lg:flex items-center justify-center p-12 gradient-hero overflow-hidden"
      >
        <HeroParticles variant="section" id="hero-particles-login" />
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 left-20 opacity-20"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Users className="h-32 w-32 text-foreground" />
          </motion.div>
          <motion.div
            className="absolute bottom-32 right-20 opacity-20"
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
            <Sparkles className="h-64 w-64 text-foreground" />
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
              <Sparkles className="h-4 w-4 mr-2" />
              Istiqlal Youth Academy
            </Badge>
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Join a Generation of
              <span className="block gradient-text">
                Young Changemakers
              </span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Connect with engaged youth, attend exclusive events, and grow your civic and advocacy skills.
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
              { icon: Scale, text: 'Workshops and debates on civic topics' },
              { icon: Users, text: 'Network with active members across Morocco' },
              { icon: Megaphone, text: 'Learn from experienced party leaders' },
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
    </div>
  );
};

export default Login;