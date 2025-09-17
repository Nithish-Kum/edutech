# Supabase Setup Guide

## Google OAuth Configuration

To fix the "Unsupported provider: provider is not enabled" error, you need to enable Google OAuth in your Supabase dashboard:

### Step 1: Go to Supabase Dashboard
1. Visit [supabase.com](https://supabase.com) and sign in
2. Select your project: `mvsyhstaqvyqjfetjhpb`

### Step 2: Enable Google Provider
1. Navigate to **Authentication** → **Providers** in your Supabase dashboard
2. Find **Google** in the list of providers
3. Toggle **Enable sign in with Google** to ON
4. You'll need to configure:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)

### Step 3: Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Set application type to **Web application**
6. Add authorized redirect URIs:
   - `https://mvsyhstaqvyqjfetjhpb.supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**

### Step 4: Update Supabase Configuration
1. Go back to Supabase Dashboard → Authentication → Providers → Google
2. Paste the **Client ID** and **Client Secret** from Google Cloud Console
3. Set the redirect URL to: `https://mvsyhstaqvyqjfetjhpb.supabase.co/auth/v1/callback`
4. Save the configuration

## Database Schema Setup

Run the following SQL in your Supabase SQL Editor to create the required tables:

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create messages table for AI Professor chat
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  course_id varchar,
  role varchar not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create courses table
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title varchar not null,
  description text,
  difficulty varchar check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  estimated_duration varchar,
  modules jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.messages enable row level security;
alter table public.courses enable row level security;

-- Create RLS policies
create policy "Users can view their own messages" on public.messages
  for select using (auth.uid() = user_id);

create policy "Users can insert their own messages" on public.messages
  for insert with check (auth.uid() = user_id);

create policy "Users can view their own courses" on public.courses
  for select using (auth.uid() = user_id);

create policy "Users can create their own courses" on public.courses
  for insert with check (auth.uid() = user_id);
```

## Testing the Setup

1. Restart your development server: `npm run dev`
2. Try signing up with email/password first to verify basic auth works
3. Then test Google OAuth sign-in
4. Create a course using the AI Generator
5. Test the AI Professor chat functionality

## Environment Variables

Your current `.env` file should contain:
```
VITE_SUPABASE_URL=https://mvsyhstaqvyqjfetjhpb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_OPENAI_API_KEY=sk-proj-422-_NntWSe3R5UjphL10S6xUIvwHYegL...
```

Make sure there are no trailing semicolons or extra characters in the URLs.