# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/02e1200a-e219-4d5c-830a-aa271fe760f5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/02e1200a-e219-4d5c-830a-aa271fe760f5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Local Development

1. Install dependencies

```bash
npm install
```

2. Start the dev server

```bash
npm run dev
```

## Supabase Setup

1. Create a project at `https://supabase.com`.
2. Copy your Project URL and anon key into `.env`:

```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. In Supabase SQL editor, create tables:

```sql
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  description text,
  data jsonb,
  created_at timestamptz default now()
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  completed_modules int default 0,
  total_modules int default 0,
  updated_at timestamptz default now()
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  repo_url text not null,
  notes text,
  feedback text,
  score int,
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  role text check (role in ('user','assistant')) not null,
  content text not null,
  created_at timestamptz default now()
);

alter table public.courses enable row level security;
alter table public.progress enable row level security;
alter table public.assessments enable row level security;
alter table public.messages enable row level security;

create policy "users can read their courses" on public.courses
  for select using (auth.uid() = user_id);
create policy "users can insert their courses" on public.courses
  for insert with check (auth.uid() = user_id);

create policy "users can read their progress" on public.progress
  for select using (auth.uid() = user_id);
create policy "users can upsert their progress" on public.progress
  for insert with check (auth.uid() = user_id);

create policy "users can read their assessments" on public.assessments
  for select using (auth.uid() = user_id);
create policy "users can insert their assessments" on public.assessments
  for insert with check (auth.uid() = user_id);

create policy "users can read their messages" on public.messages
  for select using (auth.uid() = user_id);
create policy "users can insert their messages" on public.messages
  for insert with check (auth.uid() = user_id);
```

4. Enable email OTP in Authentication > Providers.

Note: The app falls back to localStorage if not authenticated.

## OpenAI Setup (optional)

1. Create an OpenAI API key.
2. Add to `.env`:

```
VITE_OPENAI_API_KEY=sk-...
```

3. With the key set, course generation and professor Q&A will use OpenAI. Without it, the app falls back to local deterministic stubs.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/02e1200a-e219-4d5c-830a-aa271fe760f5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
