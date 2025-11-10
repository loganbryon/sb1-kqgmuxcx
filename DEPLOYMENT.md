# PLC Automation Suite - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- A Supabase account and project set up
- Your Supabase project URL and anon key
- Git repository (GitHub recommended)
- Node.js 18+ installed locally

## Environment Variables

Your application requires these environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Option 1: Deploy to Netlify (Recommended)

Netlify provides free hosting with automatic HTTPS and is perfect for React/Vite applications.

### Step 1: Prepare Your Repository

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy to Netlify

1. Go to [Netlify](https://www.netlify.com/) and sign up/log in
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider (GitHub)
4. Select your repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** (leave empty)

6. Add environment variables:
   - Click "Show advanced" → "New variable"
   - Add `VITE_SUPABASE_URL` with your Supabase URL
   - Add `VITE_SUPABASE_ANON_KEY` with your Supabase anon key

7. Click "Deploy site"

### Step 3: Configure Redirects (Already Done)

The `dist/_redirects` file is already configured for single-page application routing.

### Step 4: Access Your Site

- Netlify will provide a URL like: `your-site-name.netlify.app`
- You can add a custom domain in site settings

## Option 2: Deploy to Vercel

Vercel is another excellent option for React applications with automatic HTTPS.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy

```bash
vercel
```

Follow the prompts:
- Link to existing project or create new
- Configure build settings (usually auto-detected)

### Step 3: Add Environment Variables

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

Or add them via the Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add both variables

### Step 4: Redeploy

```bash
vercel --prod
```

## Option 3: Deploy to Custom Server

If you want to host on your own server (VPS, AWS, etc.):

### Step 1: Build the Application

```bash
npm install
npm run build
```

### Step 2: Configure Web Server

**For Nginx:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/your/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
```

**For Apache (.htaccess in dist folder):**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Step 3: Set Environment Variables

Create a `.env.production` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Rebuild with production env:
```bash
npm run build
```

### Step 4: Configure SSL

Use Let's Encrypt for free SSL certificates:

```bash
sudo certbot --nginx -d your-domain.com
```

## Supabase Configuration

### Ensure Database Migrations Are Applied

Your database should have these migrations already applied:
1. `20251107190936_create_automation_tables.sql`
2. `20251108034043_add_modbus_and_hmi_features.sql`

Verify in Supabase Dashboard:
- Go to Database → Migrations
- Check that all migrations show as applied

### Configure Authentication

1. Go to Authentication → Settings in Supabase Dashboard
2. Configure email templates (optional)
3. Add your production site URL to "Redirect URLs"
   - Example: `https://your-site.netlify.app/**`
   - Or: `https://your-domain.com/**`

### Configure CORS (if needed)

Supabase automatically handles CORS, but verify your site URL is allowed:
- Go to Project Settings → API
- Check "API Settings"

## Post-Deployment Checklist

- [ ] Site loads without errors
- [ ] User can sign up and log in
- [ ] Projects can be created
- [ ] I/O points can be added
- [ ] CSV import works
- [ ] All tabs are accessible (IO List, Modbus Map, Master Table, Comm Settings, HMI Info)
- [ ] Cause & Effect Matrix works
- [ ] Export functionality works
- [ ] Data persists after refresh

## Monitoring and Maintenance

### Netlify/Vercel Benefits
- Automatic deployments on git push
- Free SSL certificates (auto-renewed)
- Global CDN
- Branch previews for testing

### Update Deployment

For Netlify:
- Push to your Git repository - automatic deployment

For Vercel:
```bash
git push
vercel --prod
```

## Troubleshooting

### Environment Variables Not Working
- Ensure variables start with `VITE_` prefix
- Rebuild after adding new variables
- Check browser console for connection errors

### 404 Errors on Route Changes
- Verify `_redirects` file is in `dist` folder
- Check web server rewrite rules
- Ensure SPA routing is configured

### Supabase Connection Issues
- Verify environment variables are correct
- Check Supabase project is active
- Verify API keys are not expired
- Check browser console for CORS errors

### Authentication Not Working
- Add your production URL to Supabase redirect URLs
- Check email confirmation settings
- Verify RLS policies are enabled

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use environment variables** for all secrets
3. **Keep Supabase keys secure** - Never expose service role key
4. **Enable RLS** on all tables - Already configured
5. **Use HTTPS** in production - Automatic with Netlify/Vercel
6. **Regular backups** - Configure in Supabase Dashboard

## Performance Optimization

Already implemented:
- ✅ Vite for fast builds
- ✅ Code splitting
- ✅ Optimized bundle size
- ✅ Database indexes on foreign keys

Additional recommendations:
- Enable caching headers in web server
- Use CDN for static assets
- Monitor Supabase usage and optimize queries if needed

## Support and Resources

- **Netlify Docs:** https://docs.netlify.com/
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev/guide/

## Quick Start Commands

**Local Development:**
```bash
npm install
npm run dev
```

**Build for Production:**
```bash
npm run build
npm run preview  # Preview production build locally
```

**Deploy to Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**Deploy to Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

Your PLC Automation Suite is now ready for production deployment with enterprise-grade features including:
- Modbus communication configuration
- Master-slave table management
- Communication port settings
- HMI/SCADA integration
- CSV/XLSX import functionality
- Real-time data persistence with Supabase
- Secure authentication and authorization
- Professional UI with responsive design
