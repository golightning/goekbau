/**
 * Kanarienvogel für den Nachweis „Entwürfe nicht im auslieferbaren Artefakt“ (redesign-home-page D5).
 * Jede Entwurfsseite rendert diese Zeichenkette und bindet `assets/canary.svg` ein. `scripts/check-artifact.mjs`
 * verlangt: im auslieferbaren Artefakt keins von beiden, im Prüfbuild beides (Positivkontrolle).
 * Die Zeichenkette darf nirgends sonst im Code vorkommen.
 */
export const DRAFT_CANARY = "goekbau-entwurf-kanarie-d2d473bfcc8673a80cfb4b8f";
