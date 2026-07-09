import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, User, LogOut, Languages, Menu, ChevronDown, Home, Calendar, Image, LogIn, X } from 'lucide-react';
import NotificationToggle from './NotificationToggle';
import { ThemeToggle } from './ThemeToggle';
import { AnthemPlayer } from './AnthemPlayer';
import { SocialFollow } from './SocialFollow';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const primaryLinks = [
    { to: '/', label: t.nav.home },
    { to: '/about', label: t.nav.about },
    { to: '/events', label: t.nav.events },
    { to: '/gallery', label: 'Gallery' },
    { to: '/members', label: t.nav.members },
    { to: '/contact', label: t.nav.contact },
  ];

  const moreLinks = [
    { to: '/podcasts', label: 'Podcasts' },
    { to: '/blog', label: 'Blog' },
    { to: '/polls', label: 'Polls' },
    { to: '/forms', label: 'Forms' },
    { to: '/quizzes', label: 'Quizzes' },
  ];

  const navLinks = [...primaryLinks.slice(0, 5), ...moreLinks, primaryLinks[5]];

  // Dynamic user links based on role
  const getUserLinks = () => {
    if (!isAuthenticated || !user) return [];
    
    const role = user.role;
    
    if (role === 'ADMIN') {
      return [
        { to: '/admin/dashboard', label: 'Admin Dashboard' },
        { to: '/admin/events', label: 'Manage Events' },
        { to: '/admin/users', label: 'Manage Users' },
      ];
    } else if (role === 'STAFF') {
      return [
        { to: '/staff/dashboard', label: 'Staff Dashboard' },
        { to: '/staff/events', label: 'Manage Events' },
        { to: '/staff/qr-scanner', label: 'QR Scanner' },
      ];
    } else {
      return [
        { to: '/dashboard', label: t.nav.dashboard },
        { to: '/profile', label: t.nav.profile },
        { to: '/notifications', label: t.nav.notifications },
      ];
    }
  };

  const userLinks = getUserLinks();

  const profileBottomLink = !isAuthenticated
    ? { to: '/login', label: t.nav.login, icon: LogIn }
    : user?.role === 'ADMIN'
    ? { to: '/admin/dashboard', label: 'Admin', icon: User }
    : user?.role === 'STAFF'
    ? { to: '/staff/dashboard', label: 'Staff', icon: User }
    : { to: '/dashboard', label: t.nav.dashboard, icon: User };

  const bottomNavLinks = [
    { to: '/', label: t.nav.home, icon: Home },
    { to: '/events', label: t.nav.events, icon: Calendar },
    { to: '/gallery', label: 'Gallery', icon: Image },
    profileBottomLink,
  ];

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-border/60 shadow-card'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="relative flex items-center justify-between h-[4.5rem]">
          {/* Mobile-only: Follow us / anthem / theme, centered */}
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 sm:hidden">
            <SocialFollow />
            <AnthemPlayer />
            <ThemeToggle />
          </div>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-primary blur-lg opacity-0 group-hover:opacity-40 transition-opacity"></div>
              <img
                src="/logo.png"
                alt="Istiqlal Youth Academy"
                className="h-12 w-12 relative z-10 transition-transform duration-300 group-hover:scale-105 object-contain dark:hidden"
              />
              <img
                src="/logo-white.png"
                alt="Istiqlal Youth Academy"
                className="h-12 w-12 relative z-10 transition-transform duration-300 group-hover:scale-105 object-contain hidden dark:block"
              />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display text-base font-extrabold tracking-tight uppercase">
                Istiqlal <span className="text-primary">Youth</span> Academy
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
                Reflection · Inclusion · Advocacy
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-7">
            {primaryLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-active={location.pathname === link.to}
                className={`link-underline text-[13px] font-semibold uppercase tracking-wide transition-colors ${
                  location.pathname === link.to
                    ? 'text-foreground'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger
                data-active={moreLinks.some((l) => l.to === location.pathname)}
                className={`link-underline inline-flex items-center gap-1 text-[13px] font-semibold uppercase tracking-wide transition-colors outline-none ${
                  moreLinks.some((l) => l.to === location.pathname)
                    ? 'text-foreground'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                More
                <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-xl">
                {moreLinks.map((link) => (
                  <DropdownMenuItem key={link.to} asChild>
                    <Link
                      to={link.to}
                      className={`w-full text-[13px] font-semibold uppercase tracking-wide cursor-pointer ${
                        location.pathname === link.to ? 'text-primary' : ''
                      }`}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3">
            <SocialFollow />
            <AnthemPlayer />
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <NotificationToggle />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                      <div className="relative">
                        {user?.photoUrl ? (
                          <img
                            src={user.photoUrl}
                            alt={user.displayName}
                            className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center ${
                            user?.photoUrl ? 'hidden' : ''
                          }`}
                        >
                          <span className="font-semibold text-white text-xs">
                            {user?.displayName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-semibold">{user?.displayName}</div>
                    <div className="px-2 py-0.5 text-xs text-muted-foreground">{user?.email}</div>
                    <DropdownMenuItem asChild>
                      <Link to={
                        user?.role === 'ADMIN' ? '/admin/dashboard' :
                        user?.role === 'STAFF' ? '/staff/dashboard' :
                        '/dashboard'
                      }>{t.nav.dashboard}</Link>
                    </DropdownMenuItem>
                    {user?.role === 'USER' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/my-registrations">My Registrations</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/profile">{t.nav.profile}</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user?.role === 'STAFF' && (
                      <DropdownMenuItem asChild>
                        <Link to="/staff/events">Organizer</Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'ADMIN' && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin/users">Admin</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t.nav.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="rounded-full font-semibold">
                  <Link to="/login">{t.nav.login}</Link>
                </Button>
                <Button asChild className="rounded-full gradient-primary font-semibold px-6 shadow-glow hover:opacity-90 transition-opacity">
                  <Link to="/register">{t.nav.register}</Link>
                </Button>
              </div>
            )}
          </div>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Completely outside nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Slide-up Menu (bottom sheet) */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-x-0 bottom-0 max-h-[88vh] w-full rounded-t-3xl bg-background shadow-2xl z-[100] lg:hidden overflow-y-auto"
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="h-1.5 w-12 rounded-full bg-foreground/15" />
                </div>

                {/* Header */}
                <div className="relative overflow-hidden rounded-t-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-90"></div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/30"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div className="relative px-6 py-8">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                      <img
                        src="/logo-white.png"
                        alt="Istiqlal Youth Academy"
                        className="h-14 w-14 relative z-10 object-contain drop-shadow-lg"
                      />
                      <div className="flex flex-col">
                        <span className="font-display text-xl font-bold text-white">
                          Istiqlal Youth Academy
                        </span>
                        <span className="text-xs text-white/80">Reflection • Inclusion • Advocacy</span>
                      </div>
                    </Link>
                    
                    {isAuthenticated && user && (
                      <div className="mt-6 pt-6 border-t border-white/20">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0">
                            {user.photoUrl ? (
                              <img
                                src={user.photoUrl}
                                alt={user.displayName}
                                className="h-12 w-12 rounded-full object-cover ring-2 ring-white/30"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div
                              className={`h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ${
                                user.photoUrl ? 'hidden' : ''
                              }`}
                            >
                              <span className="text-lg font-bold text-white">
                                {user.displayName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
                            <p className="text-xs text-white/70 truncate">{user.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-white/20 text-white rounded-full">
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="px-4 py-6">
                  <div className="space-y-1">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.to}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={link.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-base font-medium hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 group"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {userLinks.length > 0 && (
                    <>
                      <div className="my-4 border-t border-border"></div>
                      <div className="space-y-1">
                        {userLinks.map((link, index) => (
                          <motion.div
                            key={link.to}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (navLinks.length + index) * 0.05 }}
                          >
                            <Link
                              to={link.to}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-base font-medium hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 group"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              {link.label}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}

                  {!isAuthenticated && (
                    <>
                      <div className="my-4 border-t border-border"></div>
                      <div className="space-y-2 px-4">
                        <Link
                          to="/login"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block w-full px-4 py-3 text-center text-base font-medium border border-primary text-primary rounded-lg hover:bg-primary/10 transition-all duration-200"
                        >
                          {t.nav.login}
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block w-full px-4 py-3 text-center text-base font-medium gradient-primary text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {t.nav.register}
                        </Link>
                      </div>
                    </>
                  )}

                  {isAuthenticated && (
                    <>
                      <div className="my-4 border-t border-border"></div>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
                      >
                        <LogOut className="h-5 w-5" />
                        {t.nav.logout}
                      </button>
                    </>
                  )}

                  <div className="my-4 border-t border-border"></div>
                  <div className="flex flex-col items-center gap-3 px-4 pb-2">
                    <SocialFollow />
                    <div className="flex items-center gap-2">
                      <AnthemPlayer />
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      {/* Bottom tab bar - mobile only */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/90 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {bottomNavLinks.map((link) => {
          const active = location.pathname === link.to;
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                active ? 'text-primary' : 'text-foreground/55'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              {link.label}
            </Link>
          );
        })}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/55 transition-colors"
        >
          <Menu className="h-5 w-5" />
          Menu
        </button>
      </nav>
    </>
  );
};