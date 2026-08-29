export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const INITIAL_AUTH_STATE: AuthActionState = { status: "idle" };

type Credentials = {
  email: string;
  password: string;
  displayName?: string;
};

type ValidationResult =
  | { success: true; data: Credentials }
  | { success: false; fieldErrors: Record<string, string> };


export function parseCredentials(
  input: FormData | Record<string, unknown>,
  mode: "login" | "signup",
): ValidationResult {
  const read = (field: string) =>
    input instanceof FormData ? input.get(field) : input[field];
  const emailValue = read("email");
  const passwordValue = read("password");
  const displayNameValue = read("displayName");
  const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const displayName =
    typeof displayNameValue === "string" ? displayNameValue.trim() : "";
  const fieldErrors: Record<string, string> = {};

  if (!email) {
    fieldErrors.email = "Informe o e-mail da conta.";
  }
  if (password.length < 8) {
    fieldErrors.password = "Use uma senha com pelo menos 8 caracteres.";
  } else if (password.length > 128) {
    fieldErrors.password = "Use uma senha com no máximo 128 caracteres.";
  }
  if (mode === "signup" && (displayName.length < 2 || displayName.length > 80)) {
    fieldErrors.displayName = "Informe um nome entre 2 e 80 caracteres.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      email,
      password,
      displayName: mode === "signup" ? displayName : undefined,
    },
  };
}

export function parseEmail(input: FormData | Record<string, unknown>) {
  const value = input instanceof FormData ? input.get("email") : input.email;
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!email) {
    return { success: false as const, fieldErrors: { email: "Informe o e-mail da conta." } };
  }
  return { success: true as const, data: { email } };
}

export function parseNewPassword(input: FormData | Record<string, unknown>) {
  const read = (field: string) =>
    input instanceof FormData ? input.get(field) : input[field];
  const passwordValue = read("password");
  const confirmationValue = read("passwordConfirmation");
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const confirmation = typeof confirmationValue === "string" ? confirmationValue : "";
  const fieldErrors: Record<string, string> = {};

  if (password.length < 8 || password.length > 128) {
    fieldErrors.password = "Use uma senha entre 8 e 128 caracteres.";
  }
  if (confirmation !== password) {
    fieldErrors.passwordConfirmation = "As senhas não coincidem.";
  }

  return Object.keys(fieldErrors).length > 0
    ? { success: false as const, fieldErrors }
    : { success: true as const, data: { password } };
}

export function safeNextPath(value: string | null | undefined, fallback = "/painel") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
