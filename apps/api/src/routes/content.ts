import { Hono, Context } from 'hono';
import { DatabaseService } from '../database';
import { jwtMiddleware, getUser } from '../middleware';

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2_IMAGES: R2Bucket;
  ENVIRONMENT: string;
  JWT_SECRET: string;
};

const contentRouter = new Hono<{ Bindings: Bindings }>();

contentRouter.use('*', jwtMiddleware());

// ============ Content Items ============

contentRouter.post('/items', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const user = getUser(c);
    const { type, content, metadata } = await c.req.json<{
      type: 'image' | 'youtube' | 'title' | 'html' | 'url' | 'code';
      content: string;
      metadata?: Record<string, any>;
    }>();

    if (!type || !content) {
      return c.json({ error: 'Type and content are required' }, 400);
    }

    const validTypes = ['image', 'youtube', 'title', 'html', 'url', 'code'];
    if (!validTypes.includes(type)) {
      return c.json({ error: 'Invalid content type' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    const itemId = await db.createContentItem(type, content, metadata);

    await db.logAction(user!.admin_id, 'CREATE_CONTENT_ITEM', 'content_items', itemId);

    return c.json({ item_id: itemId, type, content, metadata }, 201);
  } catch (error) {
    console.error('Create content error:', error);
    return c.json({ error: 'Failed to create content item' }, 500);
  }
});

contentRouter.put('/items/:itemId', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const user = getUser(c);
    const itemId = c.req.param('itemId');
    const { content, metadata } = await c.req.json<{
      content: string;
      metadata?: Record<string, any>;
    }>();

    if (!content) {
      return c.json({ error: 'Content is required' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    await db.updateContentItem(itemId, content, metadata);

    await db.logAction(user!.admin_id, 'UPDATE_CONTENT_ITEM', 'content_items', itemId);

    return c.json({ message: 'Content item updated' });
  } catch (error) {
    console.error('Update content error:', error);
    return c.json({ error: 'Failed to update content item' }, 500);
  }
});

contentRouter.delete('/items/:itemId', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const user = getUser(c);
    const itemId = c.req.param('itemId');

    const db = new DatabaseService(c.env.DB);
    await db.deleteContentItem(itemId);

    await db.logAction(user!.admin_id, 'DELETE_CONTENT_ITEM', 'content_items', itemId);

    return c.json({ message: 'Content item deleted' });
  } catch (error) {
    console.error('Delete content error:', error);
    return c.json({ error: 'Failed to delete content item' }, 500);
  }
});

// ============ Pages ============

contentRouter.post('/pages', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const user = getUser(c);
    const { type, slug, title } = await c.req.json<{
      type: 'home' | 'project' | 'about' | 'blog';
      slug: string;
      title: string;
    }>();

    if (!type || !slug || !title) {
      return c.json({ error: 'Type, slug, and title are required' }, 400);
    }

    const validTypes = ['home', 'project', 'about', 'blog'];
    if (!validTypes.includes(type)) {
      return c.json({ error: 'Invalid page type' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    const pageId = await db.createPage(type, slug, title);

    await db.logAction(user!.admin_id, 'CREATE_PAGE', 'pages', pageId);

    return c.json({ page_id: pageId, type, slug, title }, 201);
  } catch (error) {
    console.error('Create page error:', error);
    return c.json({ error: 'Failed to create page' }, 500);
  }
});

contentRouter.put('/pages/:pageId', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const user = getUser(c);
    const pageId = c.req.param('pageId');
    const { title, slug } = await c.req.json<{
      title: string;
      slug: string;
    }>();

    if (!title || !slug) {
      return c.json({ error: 'Title and slug are required' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    await db.updatePage(pageId, title, slug);

    // Invalidate static cache
    await db.invalidateCache(slug);

    await db.logAction(user!.admin_id, 'UPDATE_PAGE', 'pages', pageId);

    return c.json({ message: 'Page updated' });
  } catch (error) {
    console.error('Update page error:', error);
    return c.json({ error: 'Failed to update page' }, 500);
  }
});

contentRouter.delete('/pages/:pageId', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const user = getUser(c);
    const pageId = c.req.param('pageId');

    const db = new DatabaseService(c.env.DB);
    await db.deletePage(pageId);

    await db.logAction(user!.admin_id, 'DELETE_PAGE', 'pages', pageId);

    return c.json({ message: 'Page deleted' });
  } catch (error) {
    console.error('Delete page error:', error);
    return c.json({ error: 'Failed to delete page' }, 500);
  }
});

contentRouter.get('/pages', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const db = new DatabaseService(c.env.DB);
    const pages = await db.listPages();

    return c.json({ pages });
  } catch (error) {
    console.error('List pages error:', error);
    return c.json({ error: 'Failed to list pages' }, 500);
  }
});

// ============ Page Sections ============

contentRouter.post('/pages/:pageId/sections', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const user = getUser(c);
    const pageId = c.req.param('pageId');
    const { order, title } = await c.req.json<{
      order: number;
      title?: string;
    }>();

    if (order === undefined) {
      return c.json({ error: 'Order is required' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    const sectionId = await db.createSection(pageId, order, title);

    await db.logAction(user!.admin_id, 'CREATE_SECTION', 'page_sections', sectionId);

    return c.json({ section_id: sectionId, page_id: pageId, order, title }, 201);
  } catch (error) {
    console.error('Create section error:', error);
    return c.json({ error: 'Failed to create section' }, 500);
  }
});

contentRouter.post('/sections/:sectionId/items', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const user = getUser(c);
    const sectionId = c.req.param('sectionId');
    const { itemId, order } = await c.req.json<{
      itemId: string;
      order: number;
    }>();

    if (!itemId || order === undefined) {
      return c.json({ error: 'ItemId and order are required' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    await db.addContentToSection(sectionId, itemId, order);

    await db.logAction(user!.admin_id, 'ADD_SECTION_ITEM', 'section_content_items', itemId);

    return c.json({ message: 'Content added to section' }, 201);
  } catch (error) {
    console.error('Add section item error:', error);
    return c.json({ error: 'Failed to add item to section' }, 500);
  }
});

contentRouter.delete('/sections/:sectionId/items/:itemId', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const user = getUser(c);
    const sectionId = c.req.param('sectionId');
    const itemId = c.req.param('itemId');

    const db = new DatabaseService(c.env.DB);
    await db.removeContentFromSection(sectionId, itemId);

    await db.logAction(user!.admin_id, 'REMOVE_SECTION_ITEM', 'section_content_items', itemId);

    return c.json({ message: 'Content removed from section' });
  } catch (error) {
    console.error('Remove section item error:', error);
    return c.json({ error: 'Failed to remove item from section' }, 500);
  }
});

// ============ Settings ============

contentRouter.get('/settings/:key', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const key = c.req.param('key');
    const db = new DatabaseService(c.env.DB);
    const value = await db.getSetting(key);

    if (value === null) {
      return c.json({ error: 'Setting not found' }, 404);
    }

    return c.json({ key, value });
  } catch (error) {
    console.error('Get setting error:', error);
    return c.json({ error: 'Failed to get setting' }, 500);
  }
});

contentRouter.put('/settings/:key', async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const user = getUser(c);
    const key = c.req.param('key');
    const { value, type } = await c.req.json<{
      value: any;
      type?: 'string' | 'json';
    }>();

    if (value === undefined) {
      return c.json({ error: 'Value is required' }, 400);
    }

    const db = new DatabaseService(c.env.DB);
    await db.setSetting(key, value, type || 'string');

    await db.logAction(user!.admin_id, 'UPDATE_SETTING', 'settings', key);

    return c.json({ message: 'Setting updated' });
  } catch (error) {
    console.error('Update setting error:', error);
    return c.json({ error: 'Failed to update setting' }, 500);
  }
});

export default contentRouter;
