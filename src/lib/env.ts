// Fails with a clear message instead of an obscure downstream error when a variable is missing.
export function requireEnv(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
