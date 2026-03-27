/**
 * DS360 Auth API client
 * Production: talks to /api/*.php on the server.
 * Development (localhost): falls back to local credential check so the
 * dev server works without a running PHP/MySQL backend.
 */

import { validateCredentials } from './credentials';

const IS_DEV = import.meta.env.DEV;
const BASE   = '/api';

async function post(endpoint: string, data: Record<string, string>, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ ok: boolean; error?: string; [key: string]: unknown }>;
}

async function get(endpoint: string) {
  const res = await fetch(`${BASE}/${endpoint}`);
  return res.json() as Promise<{ ok: boolean; error?: string; [key: string]: unknown }>;
}

export async function apiLogin(email: string, password: string) {
  if (IS_DEV) {
    const valid = await validateCredentials(email, password);
    if (valid) return { ok: true, token: 'dev-session', email };
    return { ok: false, error: 'Incorrect email or password.' };
  }
  return post('login.php', { email, password });
}

export async function apiRegister(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  return post('register.php', { email, password, firstName, lastName });
}

export async function apiLogout(token: string) {
  if (IS_DEV) return { ok: true };
  return post('logout.php', {}, token);
}

export async function apiResetRequest(email: string) {
  return post('reset-request.php', { email });
}

export async function apiResetConfirm(token: string, password: string) {
  return post('reset-confirm.php', { token, password });
}

export async function apiVerifyEmail(token: string) {
  return get(`verify.php?token=${encodeURIComponent(token)}`);
}
