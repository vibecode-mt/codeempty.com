# CodeEmpty.com API Documentation

Complete API reference for CodeEmpty.com CMS. The API has two main sections:
1. **Admin API** - For managing content (requires JWT authentication)
2. **Public API** - For accessing content (requires OAuth authentication)

## Base URLs

- **Development**: `http://localhost:8787`
- **Production**: `https://codeempty-api.workers.dev`

## Authentication

### Admin API (JWT)
Admin endpoints use JWT Bearer tokens. Obtain a token by logging in:

```bash
curl -X POST https://codeempty-api.workers.dev/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@codeempty.com",
    "password": "your-password"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "admin_id": "abc123",
    "email": "admin@codeempty.com"
  },
  "expires_in": 86400
}
```

Use the token in subsequent requests:
```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

Token expires in 24 hours. Call the login endpoint again to refresh.

### Public API (OAuth)
Public API endpoints use OAuth2 Bearer tokens (API Keys). Register an app in the admin dashboard to get an API key.

```bash
Authorization: Bearer YOUR_API_KEY
```

---

## Admin API Reference

### Authentication

#### Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@codeempty.com",
  "password": "your-password"
}
```

**Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "admin_id": "abc123",
    "email": "admin@codeempty.com"
  },
  "expires_in": 86400
}
```

#### Logout
```http
POST /api/admin/logout
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**:
```json
{
  "message": "Logged out successfully"
}
```

#### Change Password
```http
POST /api/admin/change-password
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "currentPassword": "old-password",
  "newPassword": "new-password-at-least-8-chars"
}
```

**Response (200)**:
```json
{
  "message": "Password changed successfully"
}
```

**Errors**:
- `400`: Current password and new password are required
- `400`: New password must be at least 8 characters
- `401`: Current password is incorrect

#### Get Admin Status
```http
GET /api/admin/status
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**:
```json
{
  "user": {
    "admin_id": "abc123",
    "email": "admin@codeempty.com",
    "created_at": "2026-05-02T18:26:20.000Z"
  },
  "environment": "production"
}
```

### OAuth Apps

#### Register OAuth App
```http
POST /api/admin/oauth/apps
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "app_name": "My AI Assistant"
}
```

**Response (201)**:
```json
{
  "app_id": "app_xyz789",
  "app_name": "My AI Assistant",
  "api_key": "cey_abc123def456...",
  "api_secret": "secret_xyz789...",
  "note": "Save the API key and secret - they will not be shown again"
}
```

⚠️ **Important**: Save the API key and secret immediately. They're only shown once!

#### List OAuth Apps
```http
GET /api/admin/oauth/apps
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**:
```json
{
  "apps": [
    {
      "app_id": "app_xyz789",
      "app_name": "My AI Assistant",
      "api_key": "cey_abc123...",
      "created_at": "2026-05-02T18:26:20.000Z",
      "revoked": false
    }
  ]
}
```

#### Revoke OAuth App
```http
DELETE /api/admin/oauth/apps/:appId
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**:
```json
{
  "message": "OAuth app revoked successfully"
}
```

**Errors**:
- `404`: App not found

---

## Public API Reference

All public API endpoints require OAuth authentication:
```
Authorization: Bearer YOUR_API_KEY
```

### Pages

#### Get Page by Slug
```http
GET /api/pages/:slug
Authorization: Bearer YOUR_API_KEY
```

**Example**:
```http
GET /api/pages/about
Authorization: Bearer cey_abc123...
```

**Response (200)**:
```json
{
  "page_id": "page_abc123",
  "type": "about",
  "slug": "about",
  "title": "About Me",
  "sections": [
    {
      "section_id": "section_xyz",
      "page_id": "page_abc123",
      "section_order": 0,
      "section_title": "Bio",
      "content_items": [
        {
          "item_id": "item_001",
          "type": "html",
          "content": "<p>Hello, I'm a developer...</p>",
          "created_at": "2026-05-02T18:26:20.000Z",
          "updated_at": "2026-05-02T18:26:20.000Z"
        }
      ]
    }
  ],
  "published_at": "2026-05-02T18:26:20.000Z",
  "created_at": "2026-05-02T18:26:20.000Z",
  "updated_at": "2026-05-02T18:26:20.000Z"
}
```

**Errors**:
- `401`: Invalid API key
- `404`: Page not found

### Projects

#### List All Projects
```http
GET /api/projects
Authorization: Bearer YOUR_API_KEY
```

**Response (200)**:
```json
{
  "projects": [
    {
      "page_id": "project_001",
      "type": "project",
      "slug": "my-first-project",
      "title": "My First Project",
      "published_at": "2026-05-02T18:26:20.000Z",
      "created_at": "2026-05-02T18:26:20.000Z"
    }
  ]
}
```

#### Get Project Details
Use the `/pages/:slug` endpoint with a project slug:
```http
GET /api/pages/my-first-project
Authorization: Bearer YOUR_API_KEY
```

Response includes all project sections and content items.

### About

#### Get About Page
```http
GET /api/about
Authorization: Bearer YOUR_API_KEY
```

**Response (200)**: Same structure as `/pages/:slug` for the "about" page.

### Blog

#### List Blog Entries
```http
GET /api/blog
Authorization: Bearer YOUR_API_KEY
```

**Response (200)**:
```json
{
  "entries": [
    {
      "page_id": "blog_001",
      "type": "blog",
      "slug": "my-first-blog-post",
      "title": "My First Blog Post",
      "published_at": "2026-05-02T18:26:20.000Z",
      "created_at": "2026-05-02T18:26:20.000Z"
    }
  ]
}
```

#### Get Blog Entry Details
```http
GET /api/pages/my-first-blog-post
Authorization: Bearer YOUR_API_KEY
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (missing/invalid auth) |
| 404 | Not Found |
| 500 | Internal Server Error |

### Common Errors

#### 401 Unauthorized
```json
{
  "error": "Invalid API key"
}
```

#### 404 Not Found
```json
{
  "error": "Page not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Error details"
}
```

---

## Content Types

Content items can be one of these types:

| Type | Format | Example |
|------|--------|---------|
| `title` | Plain text | "My Project Title" |
| `html` | HTML string | `<p>Rich text with <strong>formatting</strong></p>` |
| `image` | URL or image path | `https://r2.example.com/image.jpg` |
| `youtube` | YouTube video URL | `https://youtube.com/watch?v=dQw4w9WgXcQ` |
| `url` | Link | `https://example.com` |
| `code` | Code snippet | `function hello() { return 'world'; }` |

---

## Rate Limiting

- Free tier: No specific rate limits
- Premium tier: To be announced

---

## Webhooks (Future)

Webhook support coming soon for content change notifications.

---

## Example: Complete Workflow

### 1. Admin Logs In
```bash
curl -X POST https://codeempty-api.workers.dev/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@codeempty.com",
    "password": "admin-password"
  }'
```

### 2. Admin Registers OAuth App
```bash
curl -X POST https://codeempty-api.workers.dev/api/admin/oauth/apps \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"app_name": "My AI Bot"}'
```

### 3. OAuth App Uses Public API
```bash
curl https://codeempty-api.workers.dev/api/projects \
  -H "Authorization: Bearer $API_KEY"
```

---

## Support

For issues or questions:
1. Check this documentation
2. Review error messages carefully
3. Open a GitHub issue with the error details

---

**API Version**: 1.0.0  
**Last Updated**: 2026-05-02
