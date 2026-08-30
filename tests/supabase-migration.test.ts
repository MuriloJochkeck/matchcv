import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const migrationsDirectory = join(process.cwd(), "supabase", "migrations");
const migrationFile = readdirSync(migrationsDirectory).find((file) => file.endsWith("_foundation.sql"));
assert.ok(migrationFile, "migration de fundação não encontrada");
const sql = readFileSync(join(migrationsDirectory, migrationFile), "utf8");

test("habilita RLS em todas as tabelas expostas do MatchCV", () => {
  const tables = [
    "profiles", "resumes", "resume_versions", "jobs", "job_versions",
    "analyses", "analysis_dimensions", "matches", "recommendations",
    "feedback", "processing_jobs",
  ];
  for (const table of tables) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  }
});

test("restringe dados e objetos privados ao proprietário autenticado", () => {
  assert.match(sql, /auth\.uid\(\)\) = user_id/i);
  assert.match(sql, /owner_id = \(select auth\.uid\(\)::text\)/i);
  assert.match(sql, /storage\.foldername\(name\)/i);
  assert.match(sql, /values \('resumes', 'resumes', false, 5242880/i);
  assert.match(sql, /rv\.id = resume_version_id and r\.user_id = \(select auth\.uid\(\)\)/i);
  assert.match(sql, /jv\.id = job_version_id and j\.user_id = \(select auth\.uid\(\)\)/i);
  assert.doesNotMatch(sql, /analysis_dimensions_insert_own/i);
  assert.doesNotMatch(sql, /matches_insert_own/i);
  assert.doesNotMatch(sql, /recommendations_insert_own/i);
  assert.doesNotMatch(sql, /service_role/i);
});


const asyncMigrationFile = readdirSync(migrationsDirectory).find((file) => file.includes("async_analysis_processing"));
assert.ok(asyncMigrationFile, "migration de processamento assíncrono não encontrada");
const asyncSql = readFileSync(join(migrationsDirectory, asyncMigrationFile), "utf8");

test("protege a fila e implementa claim transacional", () => {
  assert.match(asyncSql, /create or replace function public\.enqueue_analysis/i);
  assert.match(asyncSql, /create or replace function public\.claim_analysis_job/i);
  assert.match(asyncSql, /for update skip locked/i);
  assert.match(asyncSql, /create or replace function public\.complete_analysis_job/i);
  assert.match(asyncSql, /create or replace function public\.fail_analysis_job/i);
  assert.match(asyncSql, /revoke execute on function public\.claim_analysis_job.*authenticated/i);
  assert.doesNotMatch(asyncSql, /grant update .* to authenticated/i);
});
