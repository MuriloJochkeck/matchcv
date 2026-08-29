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

test("aceita identificadores de conta preenchidos e rejeita campos ausentes", () => {
  const credentials = parseCredentials(
    { email: "email-invalido", password: "senha-segura", displayName: "Ana" },
    "signup",
  );
  assert.equal(credentials.success, true);
  assert.equal(parseEmail({ email: "invalido" }).success, true);
  assert.equal(parseEmail({ email: "" }).success, false);
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
