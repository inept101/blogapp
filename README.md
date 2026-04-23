# BLOGG

A full-stack blogging platform built with Next.js 14, Tailwind CSS, and MongoDB. Write, publish, and discover posts with a clean dark/light UI.

---

## Features

**Writing**

- Rich text editor (TipTap) — bold, italic, headings, lists, blockquotes, code blocks, links, text alignment
- Draft/publish toggle — save privately before going public
- Cover image — paste a URL or upload directly
- Tags — categorise posts, filter by tag on the listing page

**Discovery**

- Full-text search across titles and content
- Tag cloud filter
- Pagination (9 posts per page)
- Read time estimate on every post

**Social**

- Like/unlike posts with optimistic UI
- Comments with 1-level threaded replies
- Public user profile pages (`/users/[username]`)

**Auth**

- Username + password login (existing accounts fully compatible)
- Google SSO _(optional, requires OAuth credentials)_
- GitHub SSO _(optional, requires OAuth credentials)_
- Email verification via Resend
- Change password from settings

**UX**

- Dark / light mode toggle (persists across sessions)
- Fully responsive — mobile, tablet, desktop
- My Posts dashboard — manage your own posts including drafts

---

## Tech Stack

| Layer        | Technology                             |
| ------------ | -------------------------------------- |
| Framework    | Next.js 14 (App Router)                |
| Styling      | Tailwind CSS + @tailwindcss/typography |
| Database     | MongoDB via Mongoose                   |
| Auth         | NextAuth v4 (JWT sessions)             |
| Editor       | TipTap v2                              |
| Email        | Resend                                 |
| Image Upload | Uploadthing                            |
| Deployment   | Render                                 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)

### Install

```bash
git clone https://github.com/inept101/blogapp.git
cd blogapp
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable               | Required | Description                                                                  |
| ---------------------- | -------- | ---------------------------------------------------------------------------- |
| `DB_URL`               | Yes      | MongoDB connection string                                                    |
| `NEXTAUTH_SECRET`      | Yes      | Random string for signing sessions — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL`         | Yes      | Full URL of your deployment (e.g. `http://localhost:3000` in dev)            |
| `GOOGLE_CLIENT_ID`     | No       | Google OAuth client ID for SSO                                               |
| `GOOGLE_CLIENT_SECRET` | No       | Google OAuth client secret                                                   |
| `GITHUB_CLIENT_ID`     | No       | GitHub OAuth app client ID                                                   |
| `GITHUB_CLIENT_SECRET` | No       | GitHub OAuth app client secret                                               |
| `RESEND_API_KEY`       | No       | API key from [resend.com](https://resend.com) for email verification         |
| `EMAIL_FROM`           | No       | Sender address e.g. `BLOGG <noreply@yourdomain.com>`                         |
| `UPLOADTHING_SECRET`   | No       | Secret from [uploadthing.com](https://uploadthing.com) for image uploads     |
| `UPLOADTHING_APP_ID`   | No       | App ID from Uploadthing                                                      |

> Without `RESEND_API_KEY`, verification links are printed to the console instead of emailed — useful during local development.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## Deployment (Render)

1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your repository
4. Set the following:

| Setting       | Value                          |
| ------------- | ------------------------------ |
| Environment   | Node                           |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start`                    |
| Node Version  | 18                             |

5. Add all required environment variables in the Render dashboard
6. Deploy

---

## Optional Integrations

### Google SSO

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add `https://your-app.onrender.com/api/auth/callback/google` as an authorised redirect URI
4. Copy the client ID and secret into your env vars

### GitHub SSO

1. Go to GitHub → Settings → Developer Settings → [OAuth Apps](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set the callback URL to `https://your-app.onrender.com/api/auth/callback/github`
4. Copy the client ID and secret into your env vars

### Resend Email

1. Sign up at [resend.com](https://resend.com)
2. Verify your sending domain (or use the sandbox for testing)
3. Create an API key and add it as `RESEND_API_KEY`
4. Set `EMAIL_FROM` to a verified sender address

### Uploadthing Image Upload

1. Sign up at [uploadthing.com](https://uploadthing.com)
2. Create an app and copy the secret and app ID into your env vars

---

## Admin Account

The username `admin` has elevated permissions — it can delete any post or comment. Create it by registering normally with the username `admin`.

To reset any user's password:

```bash
node scripts/reset-password.js <username> <newpassword>
```

---

## Project Structure

```
app/                  # Next.js App Router pages and API routes
├── api/              # auth, register, uploadthing, me endpoints
├── blogs/            # all posts, new post, post detail, edit
├── my-blogs/         # logged-in user's own posts
├── users/[username]/ # public profile page
├── settings/         # change password, email verification
├── login/
├── register/
└── verify-email/

components/           # shared UI components
lib/                  # db connection, auth config, server actions, email, utils
models/               # Mongoose schemas (Blog, Comment, User)
scripts/              # utility scripts (reset-password)
```

claude --resume 41e3a300-dd33-49c2-b17b-bd8aef3bbc58
