import assert from "node:assert/strict";
import test from "node:test";
import { consumeRateLimit } from "../src/server/ops/rate-limit.ts";

test("rate limit bloqueia após o limite e libera ao expirar a janela", () => {
  const key = `test-${crypto.randomUUID()}`;
  assert.equal(consumeRateLimit(key, 2, 1000, 0).allowed, true);
  assert.equal(consumeRateLimit(key, 2, 1000, 10).allowed, true);
  const blocked = consumeRateLimit(key, 2, 1000, 20);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 1);
  assert.equal(consumeRateLimit(key, 2, 1000, 1000).allowed, true);
});