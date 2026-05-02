# CodeEmpty.com - Getting Started Guide

Welcome! This guide will help you get CodeEmpty.com up and running. **This is designed for non-technical users - everything is explained step-by-step.**

## 📋 What You Have

CodeEmpty.com is a complete **CMS (Content Management System)** that runs on **Cloudflare** (free tier). It includes:

- 🌐 Your website (www.codeempty.com)
- 🔧 Admin dashboard to manage content
- 📝 Blog/diary feature
- 💾 Automatic backups on GitHub
- 🚀 Auto-deployment (no manual deploys needed!)

---

## 🚀 Quick Start (5 minutes)

### Step 1: Set Up Cloudflare
The most important step! Follow the detailed guide here:
👉 **[CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)**

This takes about 20-30 minutes and is done only once. The guide is written for non-technical users.

### Step 2: Initialize Your Database
After Cloudflare is set up, run this in your terminal (or ask your developer):

```bash
npm run dev
# Then visit: http://localhost:8787/init-db
```

You'll see:
```json
{
  "message": "Database initialized successfully",
  "admin": {
    "email": "admin@codeempty.com",
    "temporary_password": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

**Save this temporary password!** You'll use it to login.

### Step 3: Login to Admin Dashboard
1. Go to: `https://codeempty.com/admin/login`
2. Email: `admin@codeempty.com`
3. Password: The temporary password from Step 2
4. Click **Sign In**

**⚠️ Important:** Change your password immediately! Go to **Account** → **Change Password**

---

## 📚 What to Do Next

### 1. Change Your Password (Do This First!)
In the admin dashboard:
- Click **Account** in the sidebar
- Click **Change Password**
- Enter your temporary password
- Enter a new strong password
- Save

### 2. Create Your First Project
In the admin dashboard:
- Click **Pages**
- Click **Create New Page**
- Type: **Project**
- Title: "My First Project"
- Slug: `my-first-project`
- Click **Create**

### 3. Add Content
After creating a page:
- Click **Edit**
- Add sections (like "Overview", "Features", "Gallery")
- Add content items to each section:
  - **Title** - Headers/titles
  - **HTML** - Rich text with formatting
  - **Images** - Upload pictures
  - **YouTube** - Embed videos
  - **Links** - Add external links
  - **Code** - Show code snippets

### 4. Write Blog Posts
- Click **Pages** → **Create New Page**
- Type: **Blog**
- Title: "My First Blog Post"
- Slug: `my-first-blog`
- Add content like projects

### 5. Update About Me
- Create a new page of type **About**
- Slug: `about`
- Add content about yourself

---

## 🔑 Key Features

### Admin Dashboard
Located at: `https://codeempty.com/admin`

**What you can do:**
- ✅ Create pages (projects, blog posts, about)
- ✅ Add content (text, images, videos, code)
- ✅ Edit pages after publishing
- ✅ Delete pages
- ✅ Register apps (for API access)
- ✅ Change password
- ✅ View all pages

### Public Site
Located at: `https://codeempty.com`

**What visitors see:**
- Homepage with your projects
- Project detail pages
- About me page
- Blog/diary with posts
- Navigation menu

### API (For Developers)
Located at: `https://codeempty-api.workers.dev`

**What it does:**
- Access content programmatically
- Build custom integrations
- Connect to AI services (MCP)

Get API keys from Admin → OAuth Apps

---

## 🆘 Troubleshooting

### "Cannot login"
- Verify your email is exactly: `admin@codeempty.com`
- Check that you're using the right password
- Clear your browser cookies and try again
- Check your password hasn't expired

### "Pages not showing"
- Make sure the page is published (check status)
- Wait a few seconds for cache to update
- Refresh your browser (Ctrl+R or Cmd+R)

### "Images not uploading"
- Check file size (must be under 10MB)
- Ensure file is an image (JPG, PNG, GIF, WebP)
- Check your internet connection
- Try a different browser

### "Cannot access /admin/login"
- Wait for Cloudflare deployment to complete (~2 minutes)
- Make sure you've connected your domain to Cloudflare
- Check your domain nameservers point to Cloudflare
- Go to https://codeempty.com/admin instead of just /admin

### "Everything is broken"
- Check GitHub Actions for deployment errors
- Look at Cloudflare dashboard for errors
- Verify D1 database is created
- Review [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) again

---

## 📖 Full Documentation

For detailed information, see:

- **[README.md](./README.md)** - Complete project overview
- **[CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)** - Detailed Cloudflare setup
- **[API_DOCS.md](./API_DOCS.md)** - For developers
- **[PROGRESS_REPORT.md](./PROGRESS_REPORT.md)** - What's built and what's left

---

## 🎯 Common Workflows

### Publishing a Project
1. Go to Admin → Pages
2. Click "Create New Page"
3. Select type: **Project**
4. Fill in title and slug (URL)
5. Click "Create"
6. Click "Edit"
7. Add sections (Overview, Features, etc.)
8. Add content to sections
9. Click "Publish"
10. Visit your site to see it live

### Writing a Blog Post
1. Same as project, but select type: **Blog**
2. Enter date you want to publish
3. Add content
4. Click "Publish"

### Adding Images
1. In page editor, click "Add Image"
2. Click "Upload Image"
3. Select image from your computer
4. Image uploads to cloud storage
5. Click image to add to page

### Updating Settings (Analytics, Scripts)
1. Admin → Settings
2. Add Google Analytics code (optional)
3. Add Clarity tracking (optional)
4. Click "Save"
5. Scripts automatically added to all pages

---

## 🔐 Security & Privacy

### Your Data
- All data stored in Cloudflare (encrypted)
- Backups on GitHub (private repository)
- SSL/HTTPS everywhere
- Only you can access admin panel

### Password
- Never share your password
- Change it regularly
- Use a strong password
- If compromised, change immediately

### API Keys
- Treat like passwords
- Don't share publicly
- Revoke keys you don't use
- Can be regenerated anytime

---

## 💡 Pro Tips

1. **Use descriptive slugs**: Instead of `/blog-1`, use `/how-to-build-a-website`

2. **Take advantage of sections**: Group related content together for better organization

3. **Use images**: Visual content looks better than text-only pages

4. **Update regularly**: Fresh content keeps visitors interested

5. **Register an OAuth app**: If you plan to use the API or AI integration

6. **Backup your content**: Export your pages regularly

7. **Test before publishing**: Preview changes before going live

---

## 📞 Support

If you need help:

1. **Check documentation** - Most questions are answered in the guides
2. **Review error messages** - They usually tell you what's wrong
3. **Try different browser** - Sometimes it's a browser cache issue
4. **Check GitHub** - Look at Issues for similar problems
5. **Contact developer** - If really stuck, ask for technical help

---

## 🎉 You're Ready!

That's it! You now have a fully functional CMS for your website. Start by:

1. ✅ Setting up Cloudflare (CLOUDFLARE_SETUP.md)
2. ✅ Logging in to admin dashboard
3. ✅ Changing your password
4. ✅ Creating your first project
5. ✅ Adding content

Your site will be live at `codeempty.com` and auto-updates whenever you make changes!

**Have fun building your portfolio! 🚀**

---

*Last Updated: 2026-05-02*
