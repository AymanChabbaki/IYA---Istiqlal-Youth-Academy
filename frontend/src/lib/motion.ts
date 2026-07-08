import type { Variants } from "framer-motion";

/** Simple fade + rise on entrance. Use for section headers and standalone blocks. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/** Fade only, no movement. Use for hero backgrounds/imagery. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

/** Wrap a list container with this and each child with `fadeUp` to stagger them in. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

/** Standard viewport trigger for scroll-in animations: fires once, slightly before fully in view. */
export const viewportOnce = { once: true, margin: "-80px" } as const;
