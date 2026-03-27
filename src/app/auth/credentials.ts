/**
 * DS360 Tester Credentials
 *
 * Passwords are stored as SHA-256 hashes (hex).
 * To generate a hash for a new password, run in Node:
 *   node -e "const c=require('crypto');console.log(c.createHash('sha256').update('yourpassword').digest('hex'))"
 *
 * To add a tester, add a new entry: "email@example.com": "<sha256hex>"
 * Emails are matched case-insensitively.
 *
 * Accounts:
 */
export const credentials: Record<string, string> = {
  "ken@samincsolutions.com":
    "a441a737865aa5b0d57968353fc38a845bf1b902f95c0bd0c821fbd4b0f31e7a",
};

/** Hash a plaintext password using the browser's native WebCrypto API. */
export async function hashPassword(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Validate an email + plaintext password against the credentials store. */
export async function validateCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const stored = credentials[email.trim().toLowerCase()];
  if (!stored) return false;
  const hashed = await hashPassword(password);
  return hashed === stored;
}
