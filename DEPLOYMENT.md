# Deployment Guide

This guide will help you deploy your Local School Social Media app to production.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest for Next.js)

Vercel is the platform created by the Next.js team and offers the best integration.

#### Step 1: Prepare Your Code

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

#### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login (free tier available)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

#### Step 3: Add Environment Variables

In the Vercel project settings, go to **Settings → Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find these:**
- Go to your [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Go to **Settings** → **API**
- Copy the **Project URL** and **anon/public key**

#### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

#### Step 5: Update Supabase Settings (Important!)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URL to:
   - **Site URL**: `https://your-project-name.vercel.app`
   - **Redirect URLs**: 
     - `https://your-project-name.vercel.app/auth/callback`
     - `https://your-project-name.vercel.app/**`

---

### Option 2: Netlify

#### Step 1: Prepare Build Settings

Create a `netlify.toml` file in your project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### Step 2: Deploy

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repository
4. Add environment variables in **Site settings** → **Environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **"Deploy site"**

---

### Option 3: Self-Hosted (VPS/Server)

#### Requirements
- Node.js 18+ installed
- PM2 (process manager) recommended
- Nginx (reverse proxy) recommended

#### Steps

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Set environment variables:**
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL=your_url
   export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

3. **Start the production server:**
   ```bash
   npm start
   ```

4. **Or use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "school-social" -- start
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx** (example):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🔒 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] **Environment variables are set** in your hosting platform
- [ ] **Supabase database is set up** with all tables and policies
- [ ] **Storage bucket is created** in Supabase (named `media`, public)
- [ ] **Supabase redirect URLs** are configured for your production domain
- [ ] **Test the build locally:**
  ```bash
  npm run build
  npm start
  ```
- [ ] **Remove console.logs** from production code (optional but recommended)
- [ ] **Check `.gitignore`** to ensure `.env.local` is not committed

---

## 🌐 Custom Domain Setup

### Vercel
1. Go to your project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs with your custom domain

### Netlify
1. Go to **Site settings** → **Domain management**
2. Add custom domain
3. Configure DNS as instructed
4. Update Supabase redirect URLs

---

## 🔄 Continuous Deployment

Both Vercel and Netlify automatically deploy when you push to your main branch:

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
3. Your hosting platform will automatically build and deploy

---

## 🐛 Troubleshooting

### Build Fails

1. **Check build logs** in your hosting platform dashboard
2. **Test locally first:**
   ```bash
   npm run build
   ```
3. **Common issues:**
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies

### Authentication Not Working

1. **Check Supabase redirect URLs** are set correctly
2. **Verify environment variables** are set in production
3. **Check browser console** for errors
4. **Ensure HTTPS** is enabled (required for Supabase Auth)

### Images Not Loading

1. **Check Supabase Storage bucket** is public
2. **Verify storage policies** are set correctly
3. **Check image URLs** in browser network tab

---

## 📊 Monitoring & Analytics

### Vercel Analytics
- Built-in analytics available in Vercel dashboard
- Enable in project settings

### Supabase Dashboard
- Monitor database usage
- Check authentication logs
- View storage usage

---

## 💰 Cost Estimates

### Free Tier (Good for testing):
- **Vercel**: Free for personal projects (100GB bandwidth/month)
- **Netlify**: Free tier available
- **Supabase**: Free tier (500MB database, 1GB storage)

### Production Scale:
- **Vercel Pro**: $20/month (1TB bandwidth)
- **Supabase Pro**: $25/month (8GB database, 100GB storage)

---

## 🎉 You're Done!

Once deployed, your app will be accessible to users. Share the URL and start using your social media app!

**Next Steps:**
- Set up a custom domain
- Configure email notifications (if needed)
- Set up monitoring and error tracking
- Consider adding analytics

