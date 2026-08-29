import assert from "node:assert/strict";
import test from "node:test";
import {
  parseCredentials,
  parseEmail,
  parseNewPassword,
  safeNextPath,
} from "../src/contracts/auth.ts";

test("normaliza credenciais de cadastro sem enfraquecer a senha", () => {
  const result = parseCredentials(
    { email: "  ANA@EXEMPLO.COM ", password: "senha-segura", displayName: " Ana Souza " },
    "signup",
  );
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.email, "ana@exemplo.com");
    assert.equal(result.data.displayName, "Ana Souza");
    assert.equal(result.data.password, "senha-segura");
  }
});

test("rejeita credenciais e recuperação inválidas com erros por campo", () => {
  const credentials = parseCredentials(
    { email: "email-invalido", password: "curta", displayName: "A" },
    "signup",
  );
  assert.equal(credentials.success, false);
  if (!credentials.success) {
    assert.ok(credentials.fieldErrors.email);
    assert.ok(credentials.fieldErrors.password);
    assert.ok(credentials.fieldErrors.displayName);
  }
  assert.equal(parseEmail({ email: "invalido" }).success, false);
});

test("confirma a nova senha e bloqueia redirecionamentos externos", () => {
  const mismatch = parseNewPassword({
    password: "nova-senha",
    passwordConfirmation: "outra-senha",
  });
  assert.equal(mismatch.success, false);
  assert.equal(safeNextPath("https://malicioso.test"), "/painel");
  assert.equal(safeNextPath("//malicioso.test"), "/painel");
  assert.equal(safeNextPath("/\\malicioso.test"), "/painel");
  assert.equal(safeNextPath("/analises"), "/analises");
});
