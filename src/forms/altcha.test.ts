import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { solveAltcha } from "./altcha";

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

describe("ALTCHA-Löser", () => {
  it("findet die Zahl und liefert den Payload im ALTCHA-v1-Format", async () => {
    const challenge = {
      algorithm: "SHA-256",
      challenge: sha("salz1234" + 4242),
      maxnumber: 10000,
      salt: "salz1234",
      signature: "sig",
    };
    const payload = JSON.parse(atob(await solveAltcha(challenge)));
    expect(payload).toEqual({
      algorithm: "SHA-256",
      challenge: challenge.challenge,
      number: 4242,
      salt: "salz1234",
      signature: "sig",
    });
  });

  it("bricht ab, wenn das Signal abgebrochen wurde", async () => {
    const ctrl = new AbortController();
    ctrl.abort();
    await expect(
      solveAltcha(
        { algorithm: "SHA-256", challenge: "x", maxnumber: 10, salt: "s", signature: "" },
        ctrl.signal,
      ),
    ).rejects.toThrow();
  });
});
