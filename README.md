# Local School Social Media App

A modern social media web application for local schools built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🔐 Authentication with school selection
- 📸 Photo feed (Instagram-style)
- 🎥 Short videos feed (TikTok-style)
- 💬 Real-time chat system
- 👤 User profiles
- 👥 Friend system
- 🎨 Glassmorphism UI design
- 🌓 Dark/Light mode

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the database migrations:
Execute the SQL in `supabase/schema.sql` in your Supabase SQL editor.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **State Management**: Zustand + React Context

