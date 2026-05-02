import { Context, Next, MiddlewareHandler } from 'hono';
import { verifyJWT } from './auth';

export type AuthContext = {
  user: {
    admin_id: string;
    email: string;
  };
};

/**
 * Middleware to verify JWT token from Authorization header
 */
export function jwtMiddleware(): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid authorization header' }, 401);
    }

    const token = authHeader.substring(7);
    const jwtSecret = c.env.JWT_SECRET;

    const payload = verifyJWT(token, jwtSecret);

    if (!payload) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    (c as any).user = {
      admin_id: payload.admin_id,
      email: payload.email,
    };

    await next();
  };
}

/**
 * Middleware to verify OAuth API key
 */
export function oauthMiddleware(): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid authorization header' }, 401);
    }

    const apiKey = authHeader.substring(7);
    const db: D1Database = c.env.DB;

    const result = await db
      .prepare('SELECT * FROM oauth_apps WHERE api_key = ? AND revoked = 0')
      .bind(apiKey)
      .first<any>();

    if (!result) {
      return c.json({ error: 'Invalid API key' }, 401);
    }

    (c as any).app = {
      app_id: result.app_id,
      app_name: result.app_name,
    };

    await next();
  };
}

/**
 * Get user from context (after jwtMiddleware)
 */
export function getUser(c: Context): { admin_id: string; email: string } | null {
  return (c as any).user || null;
}

/**
 * Get OAuth app from context (after oauthMiddleware)
 */
export function getOAuthApp(c: Context): { app_id: string; app_name: string } | null {
  return (c as any).app || null;
}
