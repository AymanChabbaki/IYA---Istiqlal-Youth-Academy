import { useMemo } from "react";
import { useTheme } from "next-themes";
import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";

const initEngine = async (engine: Engine) => {
  await loadSlim(engine);
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type HeroParticlesProps = {
  /** "page": one fixed layer behind the whole scrollable page (negative z-index, never wins a stacking tie against real content).
   *  "section": scoped to the nearest `position: relative` ancestor — use inside sections that paint their own opaque/gradient
   *  background (like the hero and CTA), since a page-fixed layer can never paint above a sibling section's own background. */
  variant?: "page" | "section";
  id?: string;
};

/** Ambient drifting-constellation background. Brand pink dots + faint linking threads. */
export const HeroParticles = ({ variant = "page", id = "hero-particles" }: HeroParticlesProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const options: ISourceOptions = useMemo(() => {
    const reduced = prefersReducedMotion();
    const isPage = variant === "page";
    return {
      fullScreen: isPage ? { enable: true, zIndex: -1 } : { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: {
          value: reduced ? (isPage ? 40 : 14) : isPage ? 80 : 26,
          density: { enable: true, width: 1200, height: isPage ? 1600 : 800 },
        },
        color: { value: isDark ? ["#ff3d9a", "#e91e8c", "#ffffff"] : ["#d6006f", "#a3005c", "#33313a"] },
        opacity: { value: isDark ? { min: 0.12, max: 0.45 } : { min: 0.25, max: 0.6 } },
        size: { value: { min: 1, max: 2.6 } },
        links: {
          enable: true,
          distance: 130,
          color: isDark ? "#ff3d9a" : "#d6006f",
          opacity: isDark ? 0.14 : 0.24,
          width: 1,
        },
        move: {
          enable: !reduced,
          speed: 0.4,
          direction: "none",
          random: true,
          straight: false,
          outModes: { default: "out" },
        },
      },
      interactivity: {
        events: { onHover: { enable: false }, onClick: { enable: false }, resize: { enable: true } },
      },
    };
  }, [isDark, variant]);

  return (
    <ParticlesProvider init={initEngine}>
      <Particles
        id={id}
        options={options}
        className={variant === "page" ? "pointer-events-none" : "pointer-events-none absolute inset-0"}
        aria-hidden="true"
      />
    </ParticlesProvider>
  );
};
