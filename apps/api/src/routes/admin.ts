import { Hono, Context } from 'hono';
import {
  hashPassword,
  verifyPassword,
  generateJWT,
  generateAPIKey,
  generateAPISecret,
} from '../auth';
import { DatabaseService } from '../database';
import { jwtMiddleware, getUser } from '../middleware';

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2_IMAGES: R2Bucket;
  ENVIRONMENT: string;
  JWT_SECRET: string;
};

const adminRouter = new Hono<{ Bindings: Bindings }>();

// ============ Authentication Endpoints ============

adminRouter.post('/login', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const { email, password } = await c.req.json<{
      email: string;
      password: string;
    }>();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    const user = await db.getAdminByEmail(email);

    if (!user || !verifyPassword(password, user.password_hash)) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const token = generateJWT(
      { admin_id: user.admin_id, email: user.email },
      c.env.JWT_SECRET,
      24
    );

    await db.logAction(user.admin_id, 'LOGIN');

    return c.json(
      {
        token,
        user: {
          admin_id: user.admin_id,
          email: user.email,
        },
        expires_in: 86400,
      },
      200
    );
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

adminRouter.post('/logout', jwtMiddleware(), async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const user = getUser(c);
    const db = new DatabaseService(c.env.DB);

    await db.logAction(user!.admin_id, 'LOGOUT');

    return c.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

adminRouter.post(
  '/change-password',
  jwtMiddleware(),
  async (c: Context<{ Bindings: Bindings }>) => {
    try {
      const user = getUser(c);
      const { currentPassword, newPassword } = await c.req.json<{
        currentPassword: string;
        newPassword: string;
      }>();

      if (!currentPassword || !newPassword) {
        return c.json(
          { error: 'Current password and new password are required' },
          400
        );
      }

      if (newPassword.length < 8) {
        return c.json(
          { error: 'New password must be at least 8 characters' },
          400
        );
      }

      const db = new DatabaseService(c.env.DB);
      const adminUser = await db.getAdminById(user!.admin_id);

      if (!adminUser || !verifyPassword(currentPassword, adminUser.password_hash)) {
        return c.json({ error: 'Current password is incorrect' }, 401);
      }

      const newPasswordHash = hashPassword(newPassword);
      await db.updateAdminPassword(user!.admin_id, newPasswordHash);

      await db.logAction(user!.admin_id, 'CHANGE_PASSWORD');

      return c.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
);

adminRouter.post(
  '/oauth/apps',
  jwtMiddleware(),
  async (c: Context<{ Bindings: Bindings }>) => {
    try {
      const user = getUser(c);
      const { app_name } = await c.req.json<{ app_name: string }>();

      if (!app_name) {
        return c.json({ error: 'App name is required' }, 400);
      }

      const db = new DatabaseService(c.env.DB);
      const apiKey = generateAPIKey();
      const apiSecret = generateAPISecret();

      const result = await db.createOAuthApp(app_name, apiSecret, apiKey, user!.admin_id);

      await db.logAction(user!.admin_id, 'CREATE_OAUTH_APP', 'oauth_apps', result.app_id);

      return c.json(
        {
          app_id: result.app_id,
          app_name,
          api_key: result.api_key,
          api_secret: result.app_secret,
          note: 'Save the API key and secret - they will not be shown again',
        },
        201
      );
    } catch (error) {
      console.error('Create OAuth app error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
);

adminRouter.get('/oauth/apps', jwtMiddleware(), async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const user = getUser(c);
    const db = new DatabaseService(c.env.DB);

    const apps = await db.listOAuthApps(user!.admin_id);

    return c.json({ apps });
  } catch (error) {
    console.error('List OAuth apps error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default adminRouter;
