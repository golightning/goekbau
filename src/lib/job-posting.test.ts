import { describe, expect, it } from "vitest";
import { company, liveJobs, offerPath } from "@/lib/content";
import { jobPostingJsonLd, serializeJsonLd } from "./job-posting";

// Pflicht- und empfohlene Felder laut schema.org/Google JobPosting
const REQUIRED = ["title", "description", "datePosted", "hiringOrganization", "jobLocation"];
const RECOMMENDED = ["employmentType", "url"];

describe("JobPosting JSON-LD", () => {
  const jobs = liveJobs();

  it("existiert für jede veröffentlichte Stelle mit allen Pflichtfeldern", () => {
    expect(jobs.length).toBeGreaterThan(0);
    for (const job of jobs) {
      const ld = jobPostingJsonLd(job, company, offerPath(job));
      expect(ld["@type"]).toBe("JobPosting");
      for (const key of [...REQUIRED, ...RECOMMENDED]) {
        expect(ld, `${job.slug}: ${key}`).toHaveProperty(key);
        expect((ld as Record<string, unknown>)[key], `${job.slug}: ${key}`).toBeTruthy();
      }
      expect(ld.hiringOrganization.name).toBe(company.name);
      expect(ld.jobLocation.address.addressCountry).toBe("DE");
      expect(ld.datePosted).toMatch(/^\d{4}-\d{2}-\d{2}/);
      expect(
        ld.employmentType.every((t) => ["FULL_TIME", "PART_TIME", "CONTRACTOR", "TEMPORARY"].includes(t)),
      ).toBe(true);
    }
  });

  it("maskiert < gegen Ausbruch aus dem Script-Tag", () => {
    expect(serializeJsonLd({ x: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});
