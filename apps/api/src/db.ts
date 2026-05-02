/**
 * Database Schema for CodeEmpty.com CMS
 * This script initializes the D1 database with all necessary tables
 */

export async function initializeDatabase(db: D1Database) {
  // Users table - Admin credentials
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      admin_id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // OAuth Apps - Registered API consumers
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS oauth_apps (
      app_id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      app_name TEXT NOT NULL,
      app_secret TEXT NOT NULL,
      api_key TEXT NOT NULL UNIQUE,
      owner TEXT NOT NULL REFERENCES users(admin_id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      revoked BOOLEAN DEFAULT 0,
      UNIQUE(app_id, app_secret)
    )
  `).run();

  // Content Items - Images, videos, text, code, links
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS content_items (
      item_id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      type TEXT NOT NULL CHECK(type IN ('image', 'youtube', 'title', 'html', 'url', 'code')),
      content TEXT NOT NULL,
      metadata JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Pages - Home, Projects, About, Blog
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS pages (
      page_id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      type TEXT NOT NULL CHECK(type IN ('home', 'project', 'about', 'blog')),
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Page Sections - Groups of content items within a page
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS page_sections (
      section_id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      page_id TEXT NOT NULL REFERENCES pages(page_id) ON DELETE CASCADE,
      section_order INTEGER NOT NULL,
      section_title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(page_id, section_order)
    )
  `).run();

  // Section Content Items - Maps content to sections
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS section_content_items (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      section_id TEXT NOT NULL REFERENCES page_sections(section_id) ON DELETE CASCADE,
      item_id TEXT NOT NULL REFERENCES content_items(item_id) ON DELETE CASCADE,
      item_order INTEGER NOT NULL,
      UNIQUE(section_id, item_order)
    )
  `).run();

  // Static Cache - Pre-rendered HTML pages
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS static_cache (
      cache_id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      slug TEXT NOT NULL UNIQUE REFERENCES pages(slug),
      html_content TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Settings - Site configuration, scripts, etc.
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL,
      setting_type TEXT DEFAULT 'string',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Sessions - Admin session management
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      admin_id TEXT NOT NULL REFERENCES users(admin_id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Audit Log - Track all admin actions
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS audit_log (
      log_id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      admin_id TEXT NOT NULL REFERENCES users(admin_id),
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      changes JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  console.log('Database schema initialized successfully');
}

// Seed default settings
export async function seedDefaultSettings(db: D1Database) {
  const defaults = [
    { key: 'site_title', value: 'CodeEmpty.com', type: 'string' },
    { key: 'site_description', value: '', type: 'string' },
    { key: 'analytics_scripts', value: '[]', type: 'json' },
    { key: 'global_scripts', value: '[]', type: 'json' },
  ];

  for (const setting of defaults) {
    await db
      .prepare(
        `INSERT OR IGNORE INTO settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)`
      )
      .bind(setting.key, setting.value, setting.type)
      .run();
  }

  console.log('Default settings seeded');
}
