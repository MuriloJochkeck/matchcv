export const DEFAULT_RESUME_RETENTION_DAYS = 30;

export function getResumeRetentionDays(value = process.env.RESUME_RETENTION_DAYS) {
  const days = Number(value);
  return Number.isInteger(days) && days > 0 && days <= 3650 ? days : DEFAULT_RESUME_RETENTION_DAYS;
}

export function getResumeExpiryDate(now = new Date(), retentionDays = getResumeRetentionDays()) {
  return new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000);
}

