import { cx } from "@/components/ui/cx";
import { BASE_PATH } from "@/lib/site-env";

/** Gerendertes Markdown aus content/ (vertrauenswürdige Quelle: Repository, validiert durch Velite). */
export function Prose({ html, className }: { html: string; className?: string }) {
  // Interne Links und Bilder im Markdown um den Demo-Unterpfad ergänzen (in Produktion leer)
  const based = BASE_PATH ? html.replace(/(href|src)="\/(?!\/)/g, `$1="${BASE_PATH}/`) : html;
  return <div className={cx("prose", className)} dangerouslySetInnerHTML={{ __html: based }} />;
}
