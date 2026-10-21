import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { brand } from "@/brands";

const COOKIE = `${brand.id}_admin_session`;
const REMEMBER_DAYS = 30;
const SHORT_HOURS = 12;

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET is missing or too short — set it in .env");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(email: string, remember: boolean) {
  const lifetime = remember ? REMEMBER_DAYS * 24 * 60 * 60 : SHORT_HOURS * 60 * 60;
  const token = await new SignJWT({ email, remember })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${lifetime}s`)
    .sign(secretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { maxAge: lifetime } : {}),
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as { email: string; remember?: boolean };
  } catch {
    return null;
  }
}

export async function logoutSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

const attempts = new Map<string, { count: number; until: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function loginBlockedFor(key: string) {
  const entry = attempts.get(key);
  if (!entry || entry.until < Date.now()) return 0;
  return entry.count >= MAX_ATTEMPTS ? Math.ceil((entry.until - Date.now()) / 60000) : 0;
}

export function recordFailedLogin(key: string) {
  const entry = attempts.get(key);
  if (!entry || entry.until < Date.now()) attempts.set(key, { count: 1, until: Date.now() + WINDOW_MS });
  else entry.count++;
}

export function clearFailedLogins(key: string) {
  attempts.delete(key);
}
