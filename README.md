# CodeEmpty.com - Personal CMS Platform

A lightweight, fully-featured CMS platform hosted on **Cloudflare** (free tier) with automatic CI/CD deployment from GitHub. Perfect for personal portfolios, blogs, and project showcases.

## Features

### Admin CMS
- 🔐 Secure admin authentication with JWT-based sessions
- 📝 Content management system (images, videos, text, code, links)
- 🎨 Rich HTML editor for descriptions
- 📄 Multiple page types: Home (projects), Project Details, About Me, Blog/Diary
- 🔑 OAuth app registration for API access
- 📊 Global analytics script injection (Google Analytics, Clarity, etc.)
- 💾 Static page caching with automatic invalidation

### Public Frontend
- 🏠 Home page with project overview
- 📖 Project details pages with step-by-step content
- 📚 Blog/Diary with chronological entries
- 🎯 Fast static page serving via Cloudflare CDN
- 📱 Responsive design

### API
- 🔓 OAuth-protected API endpoints
- 🤖 Ready for future AI/MCP integration
- 📡 RESTful endpoints for content access

## Tech Stack

- **Frontend**: Next.js 14 with App Router (SSG/ISR)
- **Backend**: Cloudflare Workers + Hono.js (lightweight, Cloudflare-native)
- **Database**: Cloudflare D1 (SQLite)
- **File Storage**: Cloudflare R2 (images) or Workers KV
- **Hosting**: Cloudflare Pages (free tier)
- **Authentication**: JWT-based + OAuth2

## Quick Start

### Prerequisites
- GitHub account with the code repository
- Cloudflare account (free tier is sufficient)
- Node.js 18+ and npm

### 1. Clone & Setup Local Environment

```bash
git clone https://github.com/vibecode-mt/codeempty.com.git
cd codeempty.com
npm install
```

### 2. Create `.env.local` from template

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ZONE_ID=your_zone_id
JWT_SECRET=generate-a-random-secret-here
```

### 3. Cloudflare Setup (Manual Steps - Required by User)

⚠️ **Important**: The Cloudflare setup requires some manual configuration in the Cloudflare dashboard. This is a one-time process and should take about 20-30 minutes.

**See [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) for detailed step-by-step instructions.**

Quick summary of steps:
1. Create Cloudflare account and add domain
2. Connect GitHub repository to Cloudflare Pages (auto-deployment!)
3. Create D1 database for content storage
4. Create R2 bucket for image storage
5. Create API token for deployments
6. Deploy backend API to Cloudflare Workers
7. Initialize database tables

[→ Open CLOUDFLARE_SETUP.md for complete guide](./CLOUDFLARE_SETUP.md)

### 4. Deploy Backend API

The backend runs on Cloudflare Workers. Deploy with:

```bash
cd apps/api
npm run deploy
```

> **First deployment requires additional setup** - Cloudflare will guide you through authentication

### 5. Initialize Database

```bash
cd apps/api
npm run db:init
npm run db:seed
```

### 6. Access Admin Dashboard

Once deployed, access the admin at:
```
https://codeempty.com/admin
```

**Initial Login Credentials:**
- Email: `admin@codeempty.com`
- Password: Your GUID (see `.env` file)

⚠️ **Important**: Change your password immediately after first login!

## Project Structure

```
codeempty.com/
├── apps/
│   ├── web/                 # Next.js Frontend (Public Site)
│   │   ├── src/
│   │   │   ├── app/        # App Router pages
│   │   │   ├── components/ # React components
│   │   │   └── lib/        # Utilities
│   │   ├── public/         # Static assets
│   │   ├── next.config.js
│   │   └── package.json
│   └── api/                 # Cloudflare Workers Backend
│       ├── src/
│       │   ├── index.ts    # Hono app entry point
│       │   ├── db.ts       # Database schema
│       │   ├── auth.ts     # Authentication utilities
│       │   └── types.ts    # TypeScript types
│       ├── wrangler.toml   # Cloudflare config
│       └── package.json
├── .env.example
├── .gitignore
└── package.json             # Root workspaces config
```

## CMS Features

### Content Management
- **Content Types**: Image, YouTube Link, Title/Header, HTML, URL/Link, Code/Prompt
- **Page Types**: Home (projects list), Project Details (steps), About Me, Blog/Diary (by date)
- **Rich Editor**: HTML editor for descriptions
- **Media Upload**: Upload images directly to R2

### Admin Features
- **Dashboard**: Overview and quick access to all pages
- **Page Management**: Create, edit, publish pages
- **Content Organization**: Group content into sections
- **Static Cache**: Auto-generate and cache pages for fast serving
- **Cache Invalidation**: Automatic cache refresh on content updates

### API Management
1. Admin registers OAuth applications
2. System generates unique **API Key** and **API Secret**
3. Apps use credentials to authenticate API requests
4. Support for API token expiration and refresh

### Analytics & Scripts
- Add custom scripts (Google Analytics, Clarity, etc.)
- Scripts injected into page headers/footers
- Global or page-specific scripts

## API Endpoints

### Public API (OAuth Protected)

#### Get Pages
```bash
GET /api/pages/:slug
Authorization: Bearer YOUR_API_KEY
```

#### List Projects
```bash
GET /api/projects
Authorization: Bearer YOUR_API_KEY
```

#### Get Project Details
```bash
GET /api/projects/:project_id
Authorization: Bearer YOUR_API_KEY
```

#### Get Blog Entries
```bash
GET /api/blog?limit=10&offset=0
Authorization: Bearer YOUR_API_KEY
```

### Admin API (JWT Protected)

Admin endpoints require JWT token from login:

```bash
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@codeempty.com",
  "password": "your-password"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400
}
```

## Development

### Local Development

```bash
# Install dependencies
npm install

# Development mode (watch mode for both frontend and backend)
npm run dev

# Frontend only (Next.js)
npm run dev --workspace=apps/web

# Backend only (Cloudflare Workers)
npm run dev --workspace=apps/api
```

### Build

```bash
# Build all
npm run build

# Build frontend only
npm run build --workspace=apps/web

# Build backend only
npm run build --workspace=apps/api
```

### Type Checking

```bash
npm run type-check --workspace=apps/api
```

## CI/CD Pipeline

Every push to GitHub automatically triggers:

1. ✅ Code is pushed to GitHub
2. 🔄 Cloudflare Pages detects changes
3. 🏗️ Build pipeline runs
4. 📦 Frontend built and deployed to Cloudflare Pages
5. 🔌 Backend API deployed to Cloudflare Workers
6. 🌐 Changes live in production

No manual deployment needed!

## Database Schema

### Tables Overview

| Table | Purpose |
|-------|---------|
| `users` | Admin credentials |
| `oauth_apps` | Registered API consumers |
| `content_items` | Content (images, text, code, etc.) |
| `pages` | Main pages (home, projects, about, blog) |
| `page_sections` | Groups of content within a page |
| `section_content_items` | Mapping of content to sections |
| `static_cache` | Pre-rendered HTML pages |
| `settings` | Site configuration and global scripts |
| `sessions` | Admin session management |
| `audit_log` | Track all admin actions |

## Performance & Optimization

### Static Page Caching
- Pages are pre-rendered and cached on first visit
- Cache is served instantly from Cloudflare's global CDN
- Cache auto-invalidates when content changes in CMS

### Database Optimization
- Cloudflare D1 (SQLite) handles light to medium loads
- Free tier: 50 reads/writes per day is sufficient for personal use
- Upgrade available if needed

### File Storage
- Images served through Cloudflare R2 CDN
- Fast delivery to users worldwide
- Free tier: 10GB storage, 1M read/write requests per month

## Troubleshooting

### Pages not deploying?
1. Check GitHub repo settings
2. Verify build command: `npm run build`
3. Check build logs in Cloudflare Pages dashboard

### Database not accessible?
1. Verify D1 database ID in `wrangler.toml`
2. Check database is in same region as Workers
3. Test with: `wrangler d1 execute codeempty-db --command "SELECT 1"`

### Images not uploading?
1. Verify R2 bucket is created and public
2. Check R2 API credentials in `.env.local`
3. Verify bucket name in code matches wrangler.toml

### Admin login failing?
1. Verify admin account exists in database
2. Check JWT secret is consistent across deploys
3. Review browser console for errors

## Security

- ✅ Admin passwords hashed with PBKDF2
- ✅ JWT tokens with expiration
- ✅ OAuth2 for API authentication
- ✅ CORS configured for API
- ✅ Environment variables for secrets
- ✅ Audit log for all admin actions
- ✅ HTTPS enforced via Cloudflare

## Future Enhancements

- [ ] AI/MCP integration for content suggestions
- [ ] Scheduled publishing for blog posts
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Backup and restore functionality
- [ ] Webhooks for external integrations
- [ ] Custom domain support for subdomains

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

ISC License - See LICENSE file for details

## Support

For issues, questions, or feature requests, please open a GitHub issue.

---

**Built with ❤️ on Cloudflare**
