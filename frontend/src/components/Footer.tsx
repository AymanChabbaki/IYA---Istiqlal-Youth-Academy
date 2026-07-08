import { Link } from 'react-router-dom';
import { Mail, ArrowUpRight, Instagram, Facebook, Linkedin } from 'lucide-react';

const exploreLinks = [
  { label: 'Events', to: '/events' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Past Events', to: '/past-events' },
  { label: 'Members', to: '/members' },
];

const participateLinks = [
  { label: 'Join Us', to: '/register' },
  { label: 'Polls', to: '/polls' },
  { label: 'Podcasts', to: '/podcasts' },
  { label: 'Blog', to: '/blog' },
];

export const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-[hsl(0_0%_3%)] text-white noise">
      {/* Glow accents */}
      <div className="absolute -top-32 left-1/3 w-[36rem] h-[36rem] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 pt-20 pb-10 relative z-10">
        {/* Top: brand statement */}
        <div className="grid lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          <div className="lg:col-span-7">
            <p className="section-label mb-6">Istiqlal Youth Academy</p>
            <h2 className="font-display font-black uppercase leading-[0.95] tracking-tight text-4xl md:text-6xl mb-4">
              A generation<br />
              <span className="gradient-text">that shows up.</span>
            </h2>
            <p dir="rtl" className="font-display text-xl md:text-2xl text-white/50 mt-2">
              الأكاديمية الاستقلالية للشباب
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-8 content-start">
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40 mb-5">Explore</h4>
              <ul className="space-y-3">
                {exploreLinks.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="group inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors text-sm font-medium"
                    >
                      {item.label}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-y-0 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40 mb-5">Participate</h4>
              <ul className="space-y-3">
                {participateLinks.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="group inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors text-sm font-medium"
                    >
                      {item.label}
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Middle: socials */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-8 border-b border-white/10">
          <p className="text-sm text-white/50 max-w-md">
            Youth initiative of the Istiqlal Party in Morocco.
            Reflection, Inclusion, Advocacy.
          </p>
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com/istiqlalyouthacademy"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 hover:border-primary hover:text-white hover:shadow-glow transition-all"
            >
              <Instagram className="h-4 w-4 group-hover:text-primary transition-colors" />
              @istiqlalyouthacademy
            </a>
            <a
              href="https://www.facebook.com/p/Istiqlal-Youth-Academy-/61572416627336/"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
              className="group inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/15 text-white/80 hover:border-primary hover:text-white hover:shadow-glow transition-all"
            >
              <Facebook className="h-4 w-4 group-hover:text-primary transition-colors" />
            </a>
            <a
              href="https://ma.linkedin.com/company/istiqlal-youth-academy"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
              className="group inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/15 text-white/80 hover:border-primary hover:text-white hover:shadow-glow transition-all"
            >
              <Linkedin className="h-4 w-4 group-hover:text-primary transition-colors" />
            </a>
            <a
              href="mailto:contact@istiqlalyouthacademy.org"
              title="Email"
              className="group inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/15 text-white/80 hover:border-primary hover:text-white hover:shadow-glow transition-all"
            >
              <Mail className="h-4 w-4 group-hover:text-primary transition-colors" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Istiqlal Youth Academy. Développé par{' '}
            <a
              href="https://github.com/AymanChabbaki"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Ayman Chabbaki
            </a>
            .
          </p>
          <div className="flex gap-6 text-xs">
            <Link to="/privacy" className="text-white/40 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-white/40 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* Oversized watermark */}
      <div aria-hidden className="relative z-0 select-none pointer-events-none overflow-hidden">
        <p className="font-display font-black uppercase text-[18vw] leading-none text-center -mb-[6vw] text-white/[0.04] tracking-tight whitespace-nowrap">
          ISTIQLAL
        </p>
      </div>
    </footer>
  );
};
