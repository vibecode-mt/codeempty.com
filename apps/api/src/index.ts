import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import adminRouter from './routes/admin';
import publicRouter from './routes/public';
import { initializeDatabase, seedDefaultSettings } from './db';
import { DatabaseService } from './database';
import { hashPassword } from './auth';

// Types
type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2_IMAGES: R2Bucket;
  ENVIRONMENT: string;
  JWT_SECRET: string;
};

// Initialize Hono app
const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database on first request (optional - can also be done manually)
app.get('/init-db', async (c) => {
  try {
    const db = c.env.DB;
    
    // Initialize schema
    await initializeDatabase(db);
    
    // Seed default settings
    await seedDefaultSettings(db);
    
    // Create default admin account if it doesn't exist
    const dbService = new DatabaseService(db);
    const adminEmail = 'admin@codeempty.com';
    const existingAdmin = await dbService.getAdminByEmail(adminEmail);
    
    if (!existingAdmin) {
      const adminPassword = crypto.randomUUID();
      const passwordHash = hashPassword(adminPassword);
      
      const adminId = await dbService.createAdmin(adminEmail, passwordHash);
      
      return c.json({
        message: 'Database initialized successfully',
        admin: {
          email: adminEmail,
          temporary_password: adminPassword,
          note: 'Use this password to login. Please change it immediately!',
        },
      });
    }
    
    return c.json({ message: 'Database already initialized' });
  } catch (error) {
    console.error('Database init error:', error);
    return c.json({ error: 'Database initialization failed', details: error }, 500);
  }
});

// Admin API routes
app.route('/api/admin', adminRouter);

// Public API routes
app.route('/api', publicRouter);

// Error handling
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', message: 'The requested resource was not found' }, 404);
});

export default app;
