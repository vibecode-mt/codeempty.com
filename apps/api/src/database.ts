import { Page, ContentItem, PageSection } from './types';

export class DatabaseService {
  constructor(private db: D1Database) {}

  // ============ Users ============
  async getAdminByEmail(email: string) {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();
    return result;
  }

  async getAdminById(adminId: string) {
    const result = await this.db
      .prepare('SELECT admin_id, email, created_at FROM users WHERE admin_id = ?')
      .bind(adminId)
      .first();
    return result;
  }

  async createAdmin(email: string, passwordHash: string) {
    const adminId = this.generateId();
    await this.db
      .prepare(
        'INSERT INTO users (admin_id, email, password_hash) VALUES (?, ?, ?)'
      )
      .bind(adminId, email, passwordHash)
      .run();
    return adminId;
  }

  async updateAdminPassword(adminId: string, passwordHash: string) {
    await this.db
      .prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE admin_id = ?')
      .bind(passwordHash, adminId)
      .run();
  }

  // ============ Content Items ============
  async createContentItem(
    type: 'image' | 'youtube' | 'title' | 'html' | 'url' | 'code',
    content: string,
    metadata?: Record<string, any>
  ) {
    const itemId = this.generateId();
    await this.db
      .prepare(
        'INSERT INTO content_items (item_id, type, content, metadata) VALUES (?, ?, ?, ?)'
      )
      .bind(itemId, type, content, metadata ? JSON.stringify(metadata) : null)
      .run();
    return itemId;
  }

  async getContentItem(itemId: string): Promise<ContentItem | null> {
    const result = await this.db
      .prepare('SELECT * FROM content_items WHERE item_id = ?')
      .bind(itemId)
      .first<any>();
    
    if (!result) return null;
    
    return {
      item_id: result.item_id,
      type: result.type,
      content: result.content,
      metadata: result.metadata ? JSON.parse(result.metadata) : undefined,
      created_at: result.created_at,
      updated_at: result.updated_at,
    };
  }

  async updateContentItem(
    itemId: string,
    content: string,
    metadata?: Record<string, any>
  ) {
    await this.db
      .prepare(
        'UPDATE content_items SET content = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP WHERE item_id = ?'
      )
      .bind(content, metadata ? JSON.stringify(metadata) : null, itemId)
      .run();
  }

  async deleteContentItem(itemId: string) {
    await this.db
      .prepare('DELETE FROM content_items WHERE item_id = ?')
      .bind(itemId)
      .run();
  }

  // ============ Pages ============
  async createPage(
    type: 'home' | 'project' | 'about' | 'blog',
    slug: string,
    title: string
  ) {
    const pageId = this.generateId();
    await this.db
      .prepare(
        'INSERT INTO pages (page_id, type, slug, title, published_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
      )
      .bind(pageId, type, slug, title)
      .run();
    return pageId;
  }

  async getPageBySlug(slug: string): Promise<Page | null> {
    const pageResult = await this.db
      .prepare('SELECT * FROM pages WHERE slug = ?')
      .bind(slug)
      .first<any>();

    if (!pageResult) return null;

    // Get sections for this page
    const sectionsResult = await this.db
      .prepare(
        `SELECT ps.* FROM page_sections ps 
         WHERE ps.page_id = ? 
         ORDER BY ps.section_order ASC`
      )
      .bind(pageResult.page_id)
      .all<any>();

    const sections: PageSection[] = [];

    for (const sectionRow of sectionsResult.results || []) {
      const itemsResult = await this.db
        .prepare(
          `SELECT ci.* FROM section_content_items sci
           JOIN content_items ci ON sci.item_id = ci.item_id
           WHERE sci.section_id = ?
           ORDER BY sci.item_order ASC`
        )
        .bind(sectionRow.section_id)
        .all<any>();

      const contentItems: ContentItem[] = (itemsResult.results || []).map((row) => ({
        item_id: row.item_id,
        type: row.type,
        content: row.content,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      sections.push({
        section_id: sectionRow.section_id,
        page_id: sectionRow.page_id,
        section_order: sectionRow.section_order,
        section_title: sectionRow.section_title,
        content_items: contentItems,
      });
    }

    return {
      page_id: pageResult.page_id,
      type: pageResult.type,
      slug: pageResult.slug,
      title: pageResult.title,
      sections,
      published_at: pageResult.published_at,
      created_at: pageResult.created_at,
      updated_at: pageResult.updated_at,
    };
  }

  async updatePage(pageId: string, title: string, slug: string) {
    await this.db
      .prepare('UPDATE pages SET title = ?, slug = ?, updated_at = CURRENT_TIMESTAMP WHERE page_id = ?')
      .bind(title, slug, pageId)
      .run();
  }

  async deletePage(pageId: string) {
    await this.db
      .prepare('DELETE FROM pages WHERE page_id = ?')
      .bind(pageId)
      .run();
  }

  async listPages(type?: string) {
    const query = type
      ? 'SELECT page_id, type, slug, title, published_at, created_at FROM pages WHERE type = ? ORDER BY created_at DESC'
      : 'SELECT page_id, type, slug, title, published_at, created_at FROM pages ORDER BY created_at DESC';

    const result = await this.db.prepare(query).bind(type).all<any>();
    return result.results || [];
  }

  // ============ Page Sections ============
  async createSection(pageId: string, order: number, title?: string) {
    const sectionId = this.generateId();
    await this.db
      .prepare(
        'INSERT INTO page_sections (section_id, page_id, section_order, section_title) VALUES (?, ?, ?, ?)'
      )
      .bind(sectionId, pageId, order, title || null)
      .run();
    return sectionId;
  }

  async addContentToSection(sectionId: string, itemId: string, order: number) {
    const id = this.generateId();
    await this.db
      .prepare(
        'INSERT INTO section_content_items (id, section_id, item_id, item_order) VALUES (?, ?, ?, ?)'
      )
      .bind(id, sectionId, itemId, order)
      .run();
  }

  async removeContentFromSection(sectionId: string, itemId: string) {
    await this.db
      .prepare('DELETE FROM section_content_items WHERE section_id = ? AND item_id = ?')
      .bind(sectionId, itemId)
      .run();
  }

  // ============ OAuth Apps ============
  async createOAuthApp(appName: string, appSecret: string, apiKey: string, ownerId: string) {
    const appId = this.generateId();
    await this.db
      .prepare(
        'INSERT INTO oauth_apps (app_id, app_name, app_secret, api_key, owner) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(appId, appName, appSecret, apiKey, ownerId)
      .run();
    return { app_id: appId, api_key: apiKey, app_secret: appSecret };
  }

  async getOAuthAppByKey(apiKey: string) {
    const result = await this.db
      .prepare('SELECT * FROM oauth_apps WHERE api_key = ? AND revoked = 0')
      .bind(apiKey)
      .first<any>();
    return result;
  }

  async listOAuthApps(ownerId: string) {
    const result = await this.db
      .prepare(
        'SELECT app_id, app_name, api_key, created_at, revoked FROM oauth_apps WHERE owner = ? ORDER BY created_at DESC'
      )
      .bind(ownerId)
      .all<any>();
    return result.results || [];
  }

  async revokeOAuthApp(appId: string) {
    await this.db
      .prepare('UPDATE oauth_apps SET revoked = 1 WHERE app_id = ?')
      .bind(appId)
      .run();
  }

  // ============ Settings ============
  async getSetting(key: string) {
    const result = await this.db
      .prepare('SELECT setting_value, setting_type FROM settings WHERE setting_key = ?')
      .bind(key)
      .first<any>();

    if (!result) return null;

    if (result.setting_type === 'json') {
      return JSON.parse(result.setting_value);
    }
    return result.setting_value;
  }

  async setSetting(key: string, value: any, type: 'string' | 'json' = 'string') {
    const valueStr = type === 'json' ? JSON.stringify(value) : value;
    await this.db
      .prepare(
        'INSERT OR REPLACE INTO settings (setting_key, setting_value, setting_type, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
      )
      .bind(key, valueStr, type)
      .run();
  }

  // ============ Static Cache ============
  async cacheStaticPage(slug: string, htmlContent: string, contentHash: string, expiresInHours: number = 24) {
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();
    await this.db
      .prepare(
        `INSERT OR REPLACE INTO static_cache (cache_id, slug, html_content, content_hash, generated_at, expires_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`
      )
      .bind(this.generateId(), slug, htmlContent, contentHash, expiresAt)
      .run();
  }

  async getCachedPage(slug: string): Promise<{ html: string; hash: string } | null> {
    const result = await this.db
      .prepare(
        `SELECT html_content, content_hash FROM static_cache 
         WHERE slug = ? AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`
      )
      .bind(slug)
      .first<any>();

    if (!result) return null;
    return { html: result.html_content, hash: result.content_hash };
  }

  async invalidateCache(slug: string) {
    await this.db
      .prepare('DELETE FROM static_cache WHERE slug = ?')
      .bind(slug)
      .run();
  }

  // ============ Audit Log ============
  async logAction(adminId: string, action: string, resourceType?: string, resourceId?: string, changes?: any) {
    await this.db
      .prepare(
        'INSERT INTO audit_log (log_id, admin_id, action, resource_type, resource_id, changes) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(
        this.generateId(),
        adminId,
        action,
        resourceType || null,
        resourceId || null,
        changes ? JSON.stringify(changes) : null
      )
      .run();
  }

  // ============ Helper Methods ============
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
