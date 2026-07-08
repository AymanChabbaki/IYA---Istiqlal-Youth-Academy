import { useEffect, useState } from 'react';
import { Instagram, Facebook, Linkedin } from 'lucide-react';

const socials = [
  { label: 'Instagram', href: 'https://www.instagram.com/istiqlalyouthacademy', icon: Instagram },
  { label: 'Facebook', href: 'https://www.facebook.com/p/Istiqlal-Youth-Academy-/61572416627336/', icon: Facebook },
  { label: 'LinkedIn', href: 'https://ma.linkedin.com/company/istiqlal-youth-academy', icon: Linkedin },
];

const WORDS = ['Follow us', 'تابعونا'];
const TYPE_MS = 90;
const DELETE_MS = 45;
const HOLD_MS = 1400;

/** Typewriter loop: types a word, holds, deletes it, moves to the next. */
const useTypewriter = (words: string[]) => {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = words[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text === full) {
      timeout = setTimeout(() => setDeleting(true), HOLD_MS);
    } else if (deleting && text === '') {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        setText(full.slice(0, deleting ? text.length - 1 : text.length + 1));
      }, deleting ? DELETE_MS : TYPE_MS);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, words]);

  return text;
};

export const SocialFollow = () => {
  const typed = useTypewriter(WORDS);

  return (
    <div className="flex flex-col items-center gap-1">
      <span dir="auto" className="h-3.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/50">
        {typed}
        <span className="animate-pulse text-primary">|</span>
      </span>
      <div className="flex items-center gap-1.5">
        {socials.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-foreground/70 transition-all hover:border-primary hover:text-primary hover:shadow-glow"
          >
            <Icon className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
    </div>
  );
};
