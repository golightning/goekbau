import { cx } from "@/components/ui/cx";

/** Gerendertes Markdown aus content/ (vertrauenswürdige Quelle: Repository, validiert durch Velite). */
export function Prose({ html, className }: { html: string; className?: string }) {
  return <div className={cx("prose", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
