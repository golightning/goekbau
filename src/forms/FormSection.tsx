import { ProtectedEmail } from "@/components/ProtectedEmail";
import { emailFor, whatsappUrl } from "@/lib/content";
import { SecureForm } from "./SecureForm";
import type { FormId } from "./validate";

/**
 * Server-Wrapper: liefert die <noscript>-Alternative (form-submissions „JavaScript deaktiviert“) und
 * den Fallback-Hinweis aus den Stammdaten.
 */
export function FormSection({ form, position }: { form: FormId; position?: string }) {
  // Keine Telefonnummer auf der Website (Spam-Anrufe) – Entscheidung 25.10.2026
  const fallbackHint = "Sie erreichen uns auch per WhatsApp oder E-Mail.";
  return (
    <div>
      <noscript>
        {/* Ohne JS kein Spam-Schutz möglich → Formular ausblenden (Inline-Style ist per CSP erlaubt) */}
        <style>{"form[data-js-form]{display:none}"}</style>
        <div className="rounded-lg border-2 border-bronze-500 bg-bronze-50 p-6">
          <p className="font-semibold">
            Das Formular benötigt JavaScript für den Spam-Schutz. Bitte kontaktieren Sie uns direkt:
          </p>
          <ul className="mt-3 space-y-1">
            <li>
              <a href={whatsappUrl()} className="font-semibold text-bronze-800 underline">
                Nachricht per WhatsApp
              </a>
            </li>
            <li>
              E-Mail: <ProtectedEmail address={emailFor(form === "application" ? "management" : "general")} />
            </li>
          </ul>
        </div>
      </noscript>
      <SecureForm
        form={form}
        position={position}
        submitLabel={form === "application" ? "Bewerbung absenden" : "Nachricht senden"}
        fallbackHint={fallbackHint}
      />
    </div>
  );
}
