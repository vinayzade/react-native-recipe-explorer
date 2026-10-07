/**
 * Shared motion tokens so every animation in the app feels related.
 * Mass is always explicit: Reanimated 4's default (mass 4) makes
 * hand-tuned damping/stiffness values slow and wobbly.
 */
export const springs = {
  /** Content entering the screen: settles with a barely visible overshoot. */
  gentle: { mass: 1, damping: 18, stiffness: 170 },
  /** Touch feedback: fast and tight. */
  snappy: { mass: 0.6, damping: 15, stiffness: 300 },
  /** Playful emphasis (tab pill, favourite pop). */
  bouncy: { mass: 1, damping: 11, stiffness: 190 },
} as const;

export const durations = {
  fast: 180,
  base: 260,
  slow: 420,
} as const;

/** Delay between consecutive items in a staggered sequence. */
export const STAGGER_MS = 60;
