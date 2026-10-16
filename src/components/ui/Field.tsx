import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cx } from "./cx";

type FieldShellProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: (describedBy: string | undefined) => ReactNode;
};

/**
 * Sichtbares, verknüpftes Label; Pflichtfelder sichtbar und programmatisch ausgewiesen;
 * Hinweis und Fehler per aria-describedby (accessibility, form-submissions).
 */
export function FieldShell({ id, label, required, hint, error, children }: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-accent text-sm font-semibold">
        {label}
        {required ? (
          <span className="text-bronze-700">
            <span aria-hidden="true"> *</span>
            <span className="sr-only"> (Pflichtfeld)</span>
          </span>
        ) : (
          <span className="font-normal text-slate"> (optional)</span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-slate">
          {hint}
        </p>
      )}
      {children(describedBy)}
      {error && (
        <p id={errorId} className="text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const control =
  "w-full rounded-md border-2 border-slate bg-white px-3 py-2.5 text-base text-ink placeholder:text-slate aria-invalid:border-danger";

type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
};

export function InputField({ id, label, hint, error, required, className, ...props }: InputFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      {(describedBy) => (
        <input
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cx(control, className)}
          {...props}
        />
      )}
    </FieldShell>
  );
}

type TextareaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
};

export function TextareaField({ id, label, hint, error, required, className, ...props }: TextareaFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      {(describedBy) => (
        <textarea
          id={id}
          required={required}
          rows={6}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cx(control, "min-h-32", className)}
          {...props}
        />
      )}
    </FieldShell>
  );
}
