# Cloudflare Setup Guide for CodeEmpty.com

This guide walks you through setting up Cloudflare for hosting CodeEmpty.com. **You only need to do this once!**

## Overview

You'll need to set up the following Cloudflare services:
1. Domain configuration
2. Cloudflare Pages (for the website)
3. D1 Database (for content storage)
4. R2 Storage (for images)
5. Workers (for backend API)
6. API Token (for deployments)

**Estimated time: 20-30 minutes**

---

## Step 1: Create Cloudflare Account & Add Domain

### 1.1 Sign Up
1. Go to https://dash.cloudflare.com/sign-up
2. Enter your email and create a password
3. Verify your email address
4. Accept the terms

### 1.2 Add Your Domain
1. After signup, click **Add a site**
2. Enter your domain: `codeempty.com`
3. Click **Add site**
4. Choose the **Free** plan
5. Click **Continue**
6. Cloudflare will scan your DNS records (this takes a few seconds)
7. Click **Continue** to proceed

### 1.3 Update Domain Nameservers
⚠️ **Important**: You need to update your domain registrar (where you bought the domain) to use Cloudflare's nameservers.

Cloudflare will show you two nameservers that look like:
- `ns1.cloudflare.com`
- `ns2.cloudflare.com`

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find the DNS/Nameservers section
3. Replace the old nameservers with Cloudflare's nameservers
4. Save the changes

⏳ **Note**: DNS changes can take 24-48 hours to fully propagate. Cloudflare will send you an email when complete.

### 1.4 Verify Domain
1. Return to Cloudflare Dashboard
2. Click **Check nameservers**
3. Wait for Cloudflare to confirm (usually within minutes to hours)

**✅ Done with Step 1!**

---

## Step 2: Connect GitHub to Cloudflare Pages

This step automates deployments: whenever you push code to GitHub, Cloudflare automatically rebuilds and deploys your site.

### 2.1 In Cloudflare Dashboard
1. Go to **Workers & Pages**
2. Click **Pages** in the left sidebar
3. Click **Create a project**
4. Click **Connect to Git**

### 2.2 Authorize GitHub
1. Click **GitHub** (if asked to choose a provider)
2. You'll be redirected to GitHub
3. Click **Authorize Cloudflare**
4. If prompted, authenticate to GitHub with your password

### 2.3 Select Repository
1. Back in Cloudflare, you should see your GitHub account connected
2. Click **Select a repository**
3. Find and select: `vibecode-mt/codeempty.com`
4. If you don't see it, click **Configure the Cloudflare GitHub App** and grant access to your repositories

### 2.4 Configure Build Settings
1. Enter the following settings:

   | Setting | Value |
   |---------|-------|
   | **Framework** | Next.js |
   | **Build command** | `npm run build` |
   | **Build output directory** | `.next` |
   | **Root directory** | `apps/web` |

2. Scroll down to **Environment variables**
3. Add these variables:

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `NEXT_PUBLIC_API_URL` | `https://codeempty-api.workers.dev` |

4. **Do NOT add secrets here** (we'll use GitHub Secrets instead)

### 2.5 Deploy
1. Click **Save and Deploy**
2. Cloudflare will build and deploy your site (takes 2-5 minutes)
3. You'll see a deployment URL like: `https://codeempty.pages.dev`

### 2.6 Connect Custom Domain
1. After the first deployment, go back to Cloudflare Pages
2. Click on your project: `codeempty`
3. Go to the **Custom domain** tab
4. Click **Set up a custom domain**
5. Enter your domain: `codeempty.com`
6. Click **Continue**
7. Cloudflare will create the DNS record automatically

✅ **Your website is now live at https://codeempty.com!**

**From now on, every time you push to GitHub, your site auto-updates!** 🎉

---

## Step 3: Create D1 Database

The database stores all your CMS content (projects, blog posts, etc.).

### 3.1 In Cloudflare Dashboard
1. Go to **Workers & Pages** → **D1**
2. Click **Create Database**

### 3.2 Configure Database
1. Enter database name: `codeempty-db`
2. Choose region (select the one closest to you or leave default)
3. Click **Create**

### 3.3 Get Database ID
1. After creation, you'll see your database listed
2. Click on it to open details
3. Look for **Database ID** (it's a long alphanumeric string)
4. **Copy this ID** - you'll need it in the next step

### 3.4 Update Code
1. Open the file: `apps/api/wrangler.toml` (in your code editor)
2. Find this section:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "codeempty-db"
   database_id = "codeempty-db-id"
   ```
3. Replace `codeempty-db-id` with your actual Database ID
4. Save the file
5. Push to GitHub (the change will trigger auto-deployment)

✅ **Database created!**

---

## Step 4: Create R2 Bucket for Images

R2 is Cloudflare's storage service for images and files.

### 4.1 In Cloudflare Dashboard
1. Go to **R2** in the left sidebar
2. Click **Create Bucket**

### 4.2 Configure Bucket
1. Enter bucket name: `codeempty-images`
2. Choose region (closest to you or default)
3. Click **Create bucket**

### 4.3 Make Bucket Public
1. Click on your bucket: `codeempty-images`
2. Go to **Settings**
3. Scroll to **CORS**
4. Click **Edit**
5. Add CORS rule:
   ```json
   [
     {
       "AllowedOrigins": ["https://codeempty.com"],
       "AllowedMethods": ["GET"],
       "AllowedHeaders": ["*"]
     }
   ]
   ```
6. Click **Save**

### 4.4 Create R2 API Token
1. Go to **R2** → **Settings** (in the left sidebar, if you don't see Settings, scroll down)
2. Go to **API Tokens**
3. Click **Create API Token**
4. Enter name: `codeempty-upload`
5. Choose **Permissions**: Select "Object Read & Write", "Bucket List"
6. Choose **Applicable Buckets**: Select "codeempty-images"
7. Click **Create API Token**

### 4.5 Save Your Credentials
A popup will show your credentials. **Copy these values** - they appear only once!

- **Access Key ID** (looks like `abc123...`)
- **Secret Access Key** (looks like `xyz789...`)

### 4.6 Add to Code
1. Open `.env.local` in your project root
2. Add these lines:
   ```
   R2_ACCESS_KEY_ID=your_access_key_id_here
   R2_SECRET_ACCESS_KEY=your_secret_access_key_here
   R2_BUCKET_NAME=codeempty-images
   ```
3. Replace the values with your actual credentials
4. Save the file

⚠️ **Security Note**: Never share these credentials or commit them to GitHub!

✅ **Image storage configured!**

---

## Step 5: Create API Token for Deployments

This token allows GitHub to deploy your code automatically.

### 5.1 In Cloudflare Dashboard
1. Click your **Profile** (bottom left icon)
2. Go to **API Tokens**
3. Click **Create Token**

### 5.2 Use Template (Easiest)
1. Look for **Edit Cloudflare Workers** template
2. Click **Use template**

### 5.3 Configure Token
The template will have most settings pre-filled. Verify:

| Setting | Value |
|---------|-------|
| **Token name** | `codeempty-deploy` |
| **Permissions** | `Account.Cloudflare Workers Scripts : Edit` |
| **Account Resources** | Include → Select your account |
| **Zone Resources** | Include → Select `codeempty.com` |

4. Click **Continue to summary**

### 5.4 Copy Token
1. You'll see your token (it starts with `v1.0...`)
2. **Copy the entire token** - it appears only once!

### 5.5 Add to GitHub
1. Go to your GitHub repository: `vibecode-mt/codeempty.com`
2. Click **Settings** (top tab)
3. Go to **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**
5. Name: `CLOUDFLARE_API_TOKEN`
6. Value: Paste your API token
7. Click **Add secret**

✅ **Deployment token configured!**

---

## Step 6: Get Your Account ID

You need your Cloudflare Account ID for deployments.

### 6.1 Find Your Account ID
1. Go to **Workers & Pages** in Cloudflare Dashboard
2. In the top right, you'll see your **Account ID** (looks like `abc123def456...`)
3. Click to copy it

### 6.2 Add to GitHub
1. Go to your GitHub repository settings → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `CLOUDFLARE_ACCOUNT_ID`
4. Value: Paste your Account ID
5. Click **Add secret**

✅ **All Cloudflare secrets configured!**

---

## Step 7: Deploy Backend API

Now deploy the backend to Cloudflare Workers.

### 7.1 Install Wrangler CLI (Local)
```bash
npm install -g wrangler
```

### 7.2 Authenticate with Cloudflare
```bash
wrangler login
```

This opens a browser to authorize Wrangler. Click **Allow** to proceed.

### 7.3 Deploy Backend
```bash
cd apps/api
npm run deploy
```

Wrangler will deploy your backend and show you the URL:
```
✨ Success! Your worker is published at https://codeempty-api.workers.dev
```

✅ **Backend API deployed!**

---

## Step 8: Initialize Database

One-time setup to create all database tables.

### 8.1 Run Initialization
```bash
cd apps/api
npm run db:init
npm run db:seed
```

This creates:
- All database tables
- Default settings
- Admin account

✅ **Database initialized!**

---

## Verify Everything is Working

### 8.1 Check Website
1. Go to https://codeempty.com
2. You should see the CodeEmpty.com homepage

### 8.2 Check Admin
1. Go to https://codeempty.com/admin
2. Login with:
   - **Email**: `admin@codeempty.com`
   - **Password**: (Your GUID from `.env`)
3. You should see the admin dashboard

### 8.3 Check API
```bash
curl https://codeempty-api.workers.dev/health
```

You should get:
```json
{"status": "ok", "timestamp": "2026-05-02T18:26:20.013Z"}
```

### 8.4 Check Deployment Automation
1. Make a small change to a file in GitHub
2. Push to main branch
3. Go to your GitHub repo → **Actions**
4. You should see a deployment workflow running
5. After a few minutes, your site updates automatically

✅ **Everything is working!**

---

## What's Next?

- Change your admin password! (Go to /admin and update it)
- Start adding content through the admin dashboard
- Upload your first project and images
- Customize your site with your own content

---

## Troubleshooting

### Domain not working?
- DNS propagation can take 24-48 hours
- Check Cloudflare DNS page to see if nameservers are updated
- Verify at: https://www.whatsmydns.net/?domain=codeempty.com

### GitHub deployment failing?
- Check GitHub Actions logs in your repository
- Verify `CLOUDFLARE_API_TOKEN` secret is set
- Check that D1 database ID is correct in `wrangler.toml`

### Database not accessible?
```bash
wrangler d1 execute codeempty-db --command "SELECT 1"
```

### Can't login to admin?
- Verify email is `admin@codeempty.com`
- Check JWT_SECRET in `.env.local` is consistent
- Clear browser cookies and try again

### Images not uploading?
- Verify R2 bucket exists
- Check API credentials in `.env.local`
- Verify bucket name matches code

### Still having issues?
1. Check GitHub Issues for similar problems
2. Review Cloudflare documentation: https://developers.cloudflare.com
3. Check your email for any error messages from Cloudflare

---

## Security Checklist

- ✅ Nameservers updated to Cloudflare
- ✅ GitHub API token created and stored as secret
- ✅ Admin password changed from default GUID
- ✅ R2 bucket not publicly writable (read-only)
- ✅ Environment variables not committed to GitHub
- ✅ HTTPS enforced (automatic with Cloudflare)

---

## Next Steps in CodeEmpty.com

After Cloudflare is set up:

1. **Update Admin Password**: Go to /admin/settings
2. **Create Your First Project**: Add a project with title, description, images
3. **Write a Blog Post**: Create your first blog/diary entry
4. **Configure Analytics**: Add Google Analytics script in admin settings
5. **Test API**: Register an OAuth app and test API endpoints

---

**You've successfully set up CodeEmpty.com on Cloudflare!** 🎉

For questions or issues, check the main README.md or visit the GitHub repository.
