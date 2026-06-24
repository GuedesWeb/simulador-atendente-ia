import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const AUTH_COOKIE = 'admin_auth';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Verifica se a senha informada é a senha admin configurada
 */
export function validatePassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD não configurada no .env.local');
    return false;
  }
  return password === adminPassword;
}

/**
 * Cria um token simples de sessão e armazena em cookie
 */
export async function createSession(): Promise<string> {
  const token = Buffer.from(
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  ).toString('base64');

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS / 1000,
    path: '/',
  });

  return token;
}

/**
 * Verifica se a requisição atual tem sessão admin válida
 * Retorna true se autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE);
  return !!token?.value;
}

/**
 * Middleware-style: verifica auth em Route Handlers
 */
export async function requireAuth(): Promise<boolean> {
  const authed = await isAuthenticated();
  return authed;
}

/**
 * Destroi a sessão (logout)
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

/**
 * Extrai o token de autenticação do request (para API Routes)
 */
export function getAuthFromRequest(request: NextRequest): boolean {
  const token = request.cookies.get(AUTH_COOKIE);
  return !!token?.value;
}
