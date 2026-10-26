import canaryAsset from "./assets/canary.svg";
import { DRAFT_CANARY } from "./canary";

/** Unsichtbarer Kanarienvogel jeder Entwurfsseite (redesign-home-page D5). */
export function DraftCanary() {
  return (
    <div hidden data-draft-canary={DRAFT_CANARY}>
      <img src={canaryAsset.src} alt="" width={1} height={1} />
    </div>
  );
}
