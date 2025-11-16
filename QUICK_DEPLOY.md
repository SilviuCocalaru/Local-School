# 🚀 Quick Deploy Guide (5 Minutes)

## Fastest Way: Deploy to Vercel

### Prerequisites
- GitHub account
- Supabase project set up
- Your Supabase credentials

---

## Step-by-Step

### 1. Push to GitHub (2 minutes)

```bash
# If you haven't initialized git yet
git init
git add .
git commit -m "Ready to deploy"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel (3 minutes)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. **Import your repository** from the list
4. **Configure:**
   - Framework: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

5. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = [Your Supabase URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [Your Supabase Anon Key]
   ```
   
   **Get these from:**
   - Supabase Dashboard → Your Project → Settings → API

6. Click **"Deploy"** 🎉

### 3. Update Supabase (1 minute)

1. Go to **Supabase Dashboard** → Your Project
2. **Authentication** → **URL Configuration
3. Add to **Redirect URLs**:
   ```
   https://your-project.vercel.app/auth/callback
   https://your-project.vercel.app/**
   ```
4. Update **Site URL** to: `https://your-project.vercel.app`

### 4. Test Your App

Visit `https://your-project.vercel.app` and:
- ✅ Sign up for an account
- ✅ Create a post
- ✅ Test all features

---

## That's It! 🎉

Your app is now live and accessible to anyone with the URL.

**Pro Tips:**
- Every push to `main` branch auto-deploys
- Check deployment logs in Vercel dashboard if issues occur
- Free tier includes 100GB bandwidth/month (plenty for testing)

---

## Need Help?

- **Build errors?** Check the build logs in Vercel dashboard
- **Auth not working?** Verify Supabase redirect URLs
- **Images not loading?** Check Supabase Storage bucket is public

See `DEPLOYMENT.md` for more detailed instructions and alternative platforms.

