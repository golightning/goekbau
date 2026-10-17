import schema from "../../shared/forms.json";

export type FormId = keyof typeof schema.forms;
export type FieldDef = (typeof schema.forms)[FormId]["fields"][number] & {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  autocomplete?: string;
};
export type FieldErrors = Record<string, string>;

export const formSchema = schema;
export const limits = schema.limits;

// Gleiche Regel wie der Server (Goekbau\Forms\Validation\FieldValidator): praxisnahe RFC-5322-Teilmenge
const EMAIL =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

function msg(key: keyof typeof schema.messages, vars: Record<string, number> = {}): string {
  return schema.messages[key].replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}

export function fieldsOf(form: FormId): FieldDef[] {
  return schema.forms[form].fields as FieldDef[];
}

/** Clientseitige Vorprüfung – identische Regeln und Texte wie serverseitig (form-submissions). */
export function validate(form: FormId, input: Record<string, string>, fileCount = 0): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of fieldsOf(form)) {
    const raw = input[field.name] ?? "";
    const value = raw.trim();
    if (field.type === "files") {
      if (field.required && fileCount === 0) errors[field.name] = msg("filesRequired");
      continue;
    }
    if (field.type === "consent") {
      if (field.required && value === "") errors[field.name] = msg("consent");
      continue;
    }
    if (value === "") {
      if (field.required) errors[field.name] = msg("required");
      continue;
    }
    const length = [...value].length;
    if (field.maxLength && length > field.maxLength)
      errors[field.name] = msg("tooLong", { max: field.maxLength });
    else if (field.minLength && length < field.minLength)
      errors[field.name] = msg("tooShort", { min: field.minLength });
    else if (field.type === "email" && !EMAIL.test(value)) errors[field.name] = msg("email");
    else if (field.pattern && !new RegExp(field.pattern).test(value)) errors[field.name] = msg("pattern");
  }
  return errors;
}

/** Datei-Vorprüfung im Browser (Typ, Anzahl, Gesamtgröße) – der Server prüft zusätzlich den Inhalt. */
export function validateFiles(files: { name: string; size: number }[]): string | null {
  if (files.length > limits.maxFiles) return msg("tooManyFiles", { max: limits.maxFiles });
  const total = files.reduce((sum, f) => sum + f.size, 0);
  if (total > limits.maxTotalBytes) return msg("tooLarge");
  const bad = files.find(
    (f) => !limits.allowedExtensions.includes(f.name.split(".").pop()?.toLowerCase() ?? ""),
  );
  if (bad) return `${bad.name}: ${msg("fileType")}`;
  return null;
}
