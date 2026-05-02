import { Hono, Context } from 'hono';
import { DatabaseService } from '../database';
import { oauthMiddleware, getOAuthApp } from '../middleware';

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2_IMAGES: R2Bucket;
  ENVIRONMENT: string;
  JWT_SECRET: string;
};

const publicRouter = new Hono<{ Bindings: Bindings }>();

publicRouter.use('*', oauthMiddleware());

/**
 * GET /api/pages/:slug
 * Get page content by slug
 */
publicRouter.get('/pages/:slug', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const slug = c.req.param('slug');
    const db = new DatabaseService(c.env.DB);

    const page = await db.getPageBySlug(slug);

    if (!page) {
      return c.json({ error: 'Page not found' }, 404);
    }

    const app = getOAuthApp(c);
    console.log(\API Request: \ accessed page \\);

    return c.json(page);
  } catch (error) {
    console.error('Get page error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/projects
 * List all projects
 */
publicRouter.get('/projects', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const projects = await db.listPages('project');

    return c.json({ projects });
  } catch (error) {
    console.error('List projects error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/about
 * Get about page
 */
publicRouter.get('/about', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const aboutPage = await db.getPageBySlug('about');

    if (!aboutPage) {
      return c.json({ error: 'About page not found' }, 404);
    }

    return c.json(aboutPage);
  } catch (error) {
    console.error('Get about error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/blog
 * Get blog entries
 */
publicRouter.get('/blog', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const blogEntries = await db.listPages('blog');

    return c.json({ entries: blogEntries });
  } catch (error) {
    console.error('Get blog error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default publicRouter;
