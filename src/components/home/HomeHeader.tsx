import { LinkButton } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { MainNav } from "@/components/layout/MainNav";

/** Dunkler Header der Startseite: gleiche Navigation wie die übrigen Seiten (site-navigation), dazu die Anfrage. */
export function HomeHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/80 text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-10">
        <Logo priority />
        <div className="flex items-center gap-3 xl:gap-6">
          <MainNav tone="dark" />
          <div className="hidden lg:block">
            <LinkButton href="/kontakt/" variant="gold">
              Anfrage stellen
            </LinkButton>
          </div>
        </div>
      </div>
    </header>
  );
}
