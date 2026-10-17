import { describe, expect, it } from "vitest";
import cases from "../../shared/form-cases.json";
import { validate, validateFiles, type FormId } from "./validate";

// Dieselben Fälle prüft server/tests/FieldValidatorTest.php gegen den PHP-Validator (Task 7.1).
describe("gemeinsames Formular-Regelset (Client)", () => {
  it.each(cases.cases.map((c) => [c.name, c] as const))("%s", (_, c) => {
    const errors = validate(c.form as FormId, c.input as unknown as Record<string, string>, c.fileCount ?? 0);
    expect(Object.keys(errors).sort()).toEqual([...c.errors].sort());
  });
});

describe("Datei-Vorprüfung", () => {
  const mb = 1024 * 1024;
  it("meldet zu große Dateien vor dem Absenden", () => {
    expect(validateFiles([{ name: "cv.pdf", size: 12 * mb }])).toMatch(/10 MB/);
  });
  it("meldet mehr als 5 Dateien", () => {
    expect(validateFiles(Array.from({ length: 6 }, (_, i) => ({ name: `${i}.pdf`, size: 1 })))).toMatch(
      /höchstens 5/,
    );
  });
  it("meldet unerlaubte Typen", () => {
    expect(validateFiles([{ name: "virus.exe", size: 10 }])).toMatch(/PDF, DOCX, JPG und PNG/);
    expect(validateFiles([{ name: "alt.doc", size: 10 }])).toMatch(/nur PDF/);
  });
  it("akzeptiert erlaubte Dateien", () => {
    expect(
      validateFiles([
        { name: "Lebenslauf.PDF", size: mb },
        { name: "foto.jpeg", size: mb },
      ]),
    ).toBeNull();
  });
});
