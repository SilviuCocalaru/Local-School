# Setup Guide for Local School Social Media App

This guide will help you set up the Local School Social Media application.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your project to be fully initialized
3. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon/public key

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the placeholders with your actual Supabase credentials.

## Step 4: Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL from `supabase/schema.sql` to create all tables and policies
4. Run the SQL from `supabase/storage-setup.sql` to set up file storage

### Database Schema

The schema includes:
- **users**: User profiles with school affiliation
- **posts**: Photo and video posts
- **comments**: Comments on posts
- **likes**: Like tracking
- **friendships**: Friend relationships
- **messages**: Direct messages

All tables have Row Level Security (RLS) enabled for security.

## Step 5: Set Up Storage

1. In Supabase dashboard, go to **Storage**
2. Create a new bucket named `media`
3. Make it **public**
4. The storage policies from `supabase/storage-setup.sql` will handle permissions

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Create Your First Account

1. Navigate to the signup page
2. Fill in your details:
   - Name
   - Email
   - Select a school (Liceul Ciprian Porumbescu or Stefan Neaga)
   - Password (minimum 8 characters)
3. Click "Sign Up"

## Features Overview

### Authentication
- ✅ Sign up with school selection
- ✅ Login/Logout
- ✅ Protected routes
- ✅ Session management

### Photo Feed
- ✅ Instagram-style photo sharing
- ✅ Like posts
- ✅ Comment on posts
- ✅ View user profiles

### Video Feed
- ✅ TikTok-style vertical video feed
- ✅ Swipe navigation (up/down)
- ✅ Play/pause controls
- ✅ Like videos

### Chat System
- ✅ Real-time messaging
- ✅ Chat list with unread indicators
- ✅ Individual chat rooms
- ✅ Message read status

### User Profiles
- ✅ View own profile
- ✅ View other users' profiles
- ✅ See posts grid
- ✅ Friend system

### Friend System
- ✅ Send friend requests
- ✅ Accept/decline requests
- ✅ View friends list
- ✅ Chat with friends

### Create Posts
- ✅ Upload photos
- ✅ Upload videos (max 60s)
- ✅ Add captions
- ✅ File validation

### UI/UX
- ✅ Glassmorphism design
- ✅ Mobile-first responsive
- ✅ Dark/Light mode toggle
- ✅ Smooth animations
- ✅ Bottom navigation
- ✅ Floating action button

## Troubleshooting

### Database Errors
- Make sure you've run both SQL files in the correct order
- Check that RLS policies are enabled
- Verify foreign key relationships

### Storage Errors
- Ensure the `media` bucket exists and is public
- Check storage policies are applied
- Verify file size limits (10MB for images, 50MB for videos)

### Authentication Issues
- Clear browser cookies and try again
- Check that environment variables are set correctly
- Verify Supabase project is active

### Build Errors
- Delete `node_modules` and `.next` folder
- Run `npm install` again
- Check TypeScript errors with `npm run lint`

## Production Deployment

1. Build the project:
```bash
npm run build
```

2. Set environment variables in your hosting platform (Vercel, Netlify, etc.)

3. Deploy!

## Security Notes

- Never commit `.env.local` to version control
- All database operations use Row Level Security
- File uploads are validated for type and size
- Passwords are hashed by Supabase Auth
- HTTPS is required in production

## Support

For issues or questions, check:
- Next.js documentation: https://nextjs.org/docs
- Supabase documentation: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

