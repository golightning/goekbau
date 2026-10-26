import { Preview } from "@/drafts/logo3d/Preview";

export const metadata = { title: "Entwurf – 3D-Logo (Prüfansicht)" };

export default function Logo3dPreviewPage() {
  return (
    <main id="inhalt" className="min-h-dvh bg-ink">
      <Preview />
    </main>
  );
}
