import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_RESUME_RETENTION_DAYS, getResumeExpiryDate, getResumeRetentionDays } from "../src/server/resume/retention.ts";

test("usa retenção padrão e rejeita valores inseguros", () => {
  assert.equal(getResumeRetentionDays("0"), DEFAULT_RESUME_RETENTION_DAYS);
  assert.equal(getResumeRetentionDays("abc"), DEFAULT_RESUME_RETENTION_DAYS);
  assert.equal(getResumeRetentionDays("45"), 45);
});

test("calcula expiração a partir do prazo configurado", () => {
  const now = new Date("2026-08-29T12:00:00.000Z");
  assert.equal(getResumeExpiryDate(now, 30).toISOString(), "2026-09-28T12:00:00.000Z");
});