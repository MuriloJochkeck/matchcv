import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

export function createAdminClient() {
  const config = getSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!config || !serviceRoleKey) throw new Error("Worker do Supabase não está configurado.");
  return createSupabaseClient(config.url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function getProcessingWorkerSecret() {
  return process.env.PROCESSING_WORKER_SECRET?.trim() || process.env.CRON_SECRET?.trim() || "";
}