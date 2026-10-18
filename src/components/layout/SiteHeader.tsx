import { Container } from "@/components/ui/Layout";
import { Logo } from "./Logo";
import { MainNav } from "./MainNav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-bronze-200 bg-white/95 backdrop-blur">
      <Container className="flex items-center justify-between gap-4 py-2">
        <Logo priority />
        <MainNav />
      </Container>
    </header>
  );
}
