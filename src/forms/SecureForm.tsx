"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FieldShell, InputField, TextareaField } from "@/components/ui/Field";
import { solveAltcha, type AltchaChallenge } from "./altcha";
import { fieldsOf, limits, validate, validateFiles, type FieldErrors, type FormId } from "./validate";

type Status = "idle" | "submitting" | "success" | "error";
type Prepared = { token: string; issuedAt: number; altcha: Promise<string> };

const MIN_AGE_MS = 3500; // Server verlangt ≥ 3 s zwischen Token und Absenden (spam-protection)
const MAX_AGE_MS = 110 * 60 * 1000; // Token gilt 2 h – vorher erneuern

/** Zeit seit Ausstellung – außerhalb der Komponente, da nur in Event-Handlern genutzt. */
function ageOf(ticket: Prepared): number {
  return Date.now() - ticket.issuedAt;
}

async function prepare(form: FormId, signal: AbortSignal): Promise<Prepared> {
  const res = await fetch(`/api/challenge.php?form=${form}`, {
    signal,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`challenge ${res.status}`);
  const data = (await res.json()) as { token: string; altcha: AltchaChallenge };
  const altcha = solveAltcha(data.altcha, signal);
  altcha.catch(() => {}); // Fehler werden beim Absenden behandelt
  return { token: data.token, issuedAt: Date.now(), altcha };
}

type Props = {
  form: FormId;
  /** Vorbelegung des Feldes „Position“ (career-listings „Bewerbung aus dem Angebot“) */
  position?: string;
  submitLabel: string;
  /** Hinweis bei Server-/Netzwerkfehlern: alternative Kontaktwege */
  fallbackHint: string;
};

/**
 * Formular mit Client-Vorprüfung (gleiches Regelset wie der Server), selbst gehostetem ALTCHA,
 * Honeypot, Datei-Vorprüfung, Live-Region und Doppelklick-Schutz. Wird sofort gerendert (kein Layout-Sprung);
 * ohne JS blendet der Server-Wrapper es per <noscript>-Style aus und zeigt Alternativen.
 */
export function SecureForm({ form, position, submitLabel, fallbackHint }: Props) {
  const uid = useId().replace(/:/g, "");
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [fileError, setFileError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const prepared = useRef<Promise<Prepared> | null>(null);
  const abort = useRef<AbortController | null>(null);
  const fields = fieldsOf(form);

  const refresh = useCallback(() => {
    abort.current?.abort();
    abort.current = new AbortController();
    prepared.current = prepare(form, abort.current.signal);
    prepared.current.catch(() => {});
  }, [form]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Absenden erst nach dem Hydrieren freigeben
  useEffect(() => setReady(true), []);
  useEffect(() => () => abort.current?.abort(), []);

  // Challenge holen und lösen, sobald jemand das Formular benutzt – nicht schon beim Seitenaufruf
  const warmUp = () => {
    if (!prepared.current) refresh();
  };

  const id = (name: string) => `${form}-${uid}-${name}`;

  function focusFirstError(errs: FieldErrors) {
    const first = fields.find((f) => errs[f.name]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first.name}"]`)?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return; // Doppel-Absendung verhindern
    const el = event.currentTarget;
    const data = new FormData(el);
    const input = Object.fromEntries(
      [...data.entries()].filter(([, v]) => typeof v === "string").map(([k, v]) => [k, v as string]),
    );
    const files = (data.getAll("files[]") as File[]).filter((f) => f.size > 0 || f.name);
    const clientErrors = validate(form, input, files.length);
    const filesProblem = form === "application" ? validateFiles(files) : null;
    if (filesProblem) clientErrors.files = filesProblem;
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) {
      setStatus("error");
      setMessage("Bitte prüfen Sie die markierten Felder.");
      focusFirstError(clientErrors);
      return;
    }

    setStatus("submitting");
    setMessage("Wird gesendet …");
    try {
      if (!prepared.current) refresh();
      let ticket = await prepared.current!;
      if (ageOf(ticket) > MAX_AGE_MS) {
        refresh();
        ticket = await prepared.current!;
      }
      const wait = MIN_AGE_MS - ageOf(ticket);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      data.set("_csrf_token", ticket.token);
      data.set("altcha", await ticket.altcha);

      const res = await fetch("/api/submit.php", {
        method: "POST",
        body: data,
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        errors?: FieldErrors;
      };
      prepared.current = null; // ALTCHA-Lösungen sind nur einmal gültig
      if (res.ok && body.ok) {
        setStatus("success");
        setMessage(body.message ?? "Vielen Dank!");
        el.reset();
        setErrors({});
      } else {
        setStatus("error");
        setErrors(body.errors ?? {});
        setMessage(
          `${body.message ?? "Ihre Nachricht konnte nicht gesendet werden."}${res.status >= 500 || res.status === 429 ? ` ${fallbackHint}` : ""}`,
        );
        if (body.errors) focusFirstError(body.errors);
      }
    } catch {
      prepared.current = null;
      setStatus("error");
      setMessage(`Ihre Nachricht konnte nicht gesendet werden. ${fallbackHint}`);
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  if (status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="rounded-lg border-2 border-success bg-white p-6 font-semibold text-success"
      >
        {message}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      data-js-form=""
      // Fallback nie per GET: Formulardaten dürfen nicht in URL/Server-Logs landen (ZAP-Befund 10024).
      // Ohne JS scheitert ein POST serverseitig an ALTCHA – es wird nichts versendet.
      method="post"
      action="/api/submit.php"
      noValidate
      onSubmit={onSubmit}
      onFocusCapture={warmUp}
      onPointerDownCapture={warmUp}
      encType="multipart/form-data"
      aria-describedby={`${id("hinweis")}`}
      className="grid gap-5"
    >
      <p id={id("hinweis")} className="text-sm text-slate">
        Felder mit <span aria-hidden="true">*</span>
        <span className="sr-only">Sternchen</span> sind Pflichtfelder.
      </p>

      {/* CSRF-Token (spam-protection „Herkunftsprüfung“) – wird beim Absenden frisch gesetzt */}
      <input type="hidden" name="_csrf_token" defaultValue="" />

      {/* Honeypot (spam-protection): für Menschen unsichtbar, für Screenreader ausgeblendet */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {fields.map((f) => {
        const error = errors[f.name];
        if (f.type === "textarea") {
          return (
            <TextareaField
              key={f.name}
              id={id(f.name)}
              name={f.name}
              label={f.label}
              required={f.required}
              maxLength={f.maxLength}
              error={error}
            />
          );
        }
        if (f.type === "consent") {
          return (
            <div key={f.name}>
              <div className="flex items-start gap-3">
                <input
                  id={id(f.name)}
                  name={f.name}
                  type="checkbox"
                  required
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? id(`${f.name}-error`) : undefined}
                  className="mt-1 size-5 shrink-0 accent-bronze-700"
                />
                <label htmlFor={id(f.name)} className="text-sm">
                  Ich habe die{" "}
                  <Link
                    href="/datenschutz/"
                    className="font-semibold text-bronze-800 underline"
                    target="_blank"
                  >
                    Datenschutzhinweise
                  </Link>{" "}
                  gelesen und bin mit der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage
                  einverstanden.
                  <span className="text-bronze-700">
                    <span aria-hidden="true"> *</span>
                    <span className="sr-only"> (Pflichtfeld)</span>
                  </span>
                </label>
              </div>
              {error && (
                <p id={id(`${f.name}-error`)} className="mt-1 text-sm font-semibold text-danger">
                  {error}
                </p>
              )}
            </div>
          );
        }
        if (f.type === "files") {
          return (
            <FieldShell
              key={f.name}
              id={id(f.name)}
              label={f.label}
              required={f.required}
              error={fileError ?? error}
              hint={`PDF, DOCX, JPG oder PNG · höchstens ${limits.maxFiles} Dateien · zusammen max. 10 MB`}
            >
              {(describedBy) => (
                <input
                  id={id(f.name)}
                  name="files[]"
                  type="file"
                  multiple
                  accept={limits.accept}
                  aria-describedby={describedBy}
                  aria-invalid={fileError || error ? true : undefined}
                  onChange={(e) => setFileError(validateFiles([...(e.currentTarget.files ?? [])]))}
                  className="w-full rounded-md border-2 border-dashed border-slate bg-white p-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-bronze-700 file:px-4 file:py-2 file:font-accent file:text-white"
                />
              )}
            </FieldShell>
          );
        }
        return (
          <InputField
            key={f.name}
            id={id(f.name)}
            name={f.name}
            type={f.type}
            label={f.label}
            required={f.required}
            maxLength={f.maxLength}
            autoComplete={f.autocomplete}
            defaultValue={f.name === "position" ? position : undefined}
            error={error}
          />
        );
      })}

      <div
        ref={statusRef}
        tabIndex={-1}
        role={status === "error" ? "alert" : "status"}
        aria-live="polite"
        className={status === "error" ? "font-semibold text-danger" : "text-slate"}
      >
        {message}
      </div>

      <div>
        <Button
          type="submit"
          disabled={!ready || status === "submitting"}
          aria-disabled={!ready || status === "submitting"}
        >
          {status === "submitting" ? "Wird gesendet …" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
