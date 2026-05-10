# Personal Cloud Drive

A self-hosted cloud storage app built with React + Cloudflare Workers + R2.

## Tech Stack

- **Frontend** — React, Vite, Tailwind CSS
- **Backend** — Cloudflare Workers, Hono Framework, JavaScript
- **Storage** — Cloudflare R2 (files), Cloudflare KV (users & requests)
- **Auth** — JWT, Google OAuth

---

## Project Structure

```
personal-cloud/
├── frontend/
│   └── personal-cloud/
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   │   ├── drive/
│       │   │   │   ├── FileGrid.jsx            # Grid view for files
│       │   │   │   ├── FileList.jsx            # List/table view for files
│       │   │   │   └── UploadButton.jsx        # Upload + drag & drop + new folder
│       │   │   ├── layout/
│       │   │   │   ├── AppLayout.jsx           # Main layout wrapper
│       │   │   │   ├── Footer.jsx              # Footer with version and rules
│       │   │   │   ├── ProtectedRoute.jsx      # Redirect to login if not authenticated
│       │   │   │   ├── Sidebar.jsx             # Left navigation sidebar
│       │   │   │   └── TopBar.jsx              # Search bar + view toggle + logout
│       │   │   └── ui/
│       │   │       ├── Button.jsx              # Reusable button component
│       │   │       ├── ContextMenu.jsx         # Right-click context menu
│       │   │       ├── FileIcon.jsx            # File type icons with colors
│       │   │       ├── Modal.jsx               # Reusable modal dialog
│       │   │       └── VersionModal.jsx        # Version history modal
│       │   ├── context/
│       │   │   ├── AuthContext.jsx             # Auth state, login, logout
│       │   │   └── DriveContext.jsx            # File state, upload, delete
│       │   ├── data/
│       │   │   └── changelog.js               # App version history
│       │   ├── pages/
│       │   │   ├── AdminPage.jsx              # Admin dashboard
│       │   │   ├── AuthCallbackPage.jsx       # Handles Google OAuth callback
|       |   |   ├── ForgotPasswordPage.jsx     # Forgot Password form
│       │   │   ├── LoginPage.jsx              # Login page
│       │   │   ├── MyDrivePage.jsx            # Main drive with breadcrumbs
│       │   │   ├── RecentPage.jsx             # Recently modified files
│       │   │   ├── RequestAccessPage.jsx      # Request access form for new users
|       |   |   ├── ResetPasswordPage.jsx      # Reset password form
│       │   │   ├── StarredPage.jsx            # Starred files
│       │   │   └── TrashPage.jsx              # Trash with restore/delete
│       │   ├── services/
│       │   │   ├── adminService.js            # Admin API calls
│       │   │   └── r2Service.js               # All R2/Worker API calls
│       │   ├── utils/
│       │   │   └── fileUtils.js               # Format size, date, file type
│       │   ├── App.jsx                        # Router setup
│       │   ├── index.css                      # Tailwind + global styles
│       │   └── main.jsx                       # React entry point
│       ├── .env                               # Frontend env variables (gitignored)
│       ├── .env.example                       # Example env variables
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
│
└── backend/
└── worker/
├── src/
│   ├── routes/
│   │   ├── admin.js               # Admin routes — manage users & requests
│   │   ├── auth.js                # Login, Google OAuth, request access
│   │   └── files.js               # File CRUD routes
│   ├── auth.js                    # JWT + password hashing
│   ├── config.js                  # Centralised env config
|   ├── email.js                   # Resend email helper
│   ├── index.js                   # Hono app entry point
│   ├── middleware.js              # Auth middleware + CORS
│   └── r2.js                      # R2 file operations
├── .dev.vars                      # Local secrets (gitignored)
├── .dev.vars.example              # Example secrets
├── package.json
└── wrangler.jsonc                 # Cloudflare Worker config
```
## Prerequisites

- Node.js 18+
- Cloudflare account (free)
- Google Cloud account (free) — for Google login

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/personal-cloud.git
cd personal-cloud
```

### 2. Frontend setup

```bash
cd frontend/personal-cloud
npm install
```

Create `.env` file:
```
VITE_WORKER_URL=http://localhost:8787
```
### 3. Backend setup

```bash
cd backend/worker
npm install
```

Create KV namespace for users:
```bash
npx wrangler kv namespace create "USERS"
```

Create KV namespace for requests:
```bash
npx wrangler kv namespace create "REQUESTS"
```
Create KV namespace for reset tokens:
```bash
npx wrangler kv namespace create "RESET_TOKENS"
```

Create KV namespace for File Meta:
```bash
wrangler kv namespace create FILE_META
```
Create R2 bucket for files:
```bash
npx wrangler r2 bucket create personal-cloud-files
```

Add the KV and R2 details to `wrangler.jsonc` when prompted.

Set JWT secret:
```bash
npx wrangler secret put JWT_SECRET
```

Create `.dev.vars` file:
```
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8787/auth/google/callback
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=onboarding@resend.dev
```
### 4. Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Go to **APIs & Services** → **OAuth consent screen** → configure it
4. Go to **Clients** → **Create OAuth Client ID**
5. Application type → **Web application**
6. Add Authorised JavaScript origins:
```
http://localhost:5173
```
7. Add Authorised redirect URIs:
```
http://localhost:8787/auth/google/callback
```
8. Copy **Client ID** and **Client Secret** into `.dev.vars`

### 5. Resend email setup

1. Go to [resend.com](https://resend.com) and sign up
2. Go to **API Keys** -> **Create API Key**
3. copy the key into `.dev.vars` as `RESEND_API_KEY`
4. For local dev, user `FROM_EMAIL=onboarding@resend.dev` (Resend's test sender - can only send to your Resend account email)
5. For production, go to **Domains** -> **Add Domain** -> add `your-domain.com` -> add the DNS records -> set `FROM_EMAIL=noreply@your-domain.com`

### 6. Create admin account

After starting the Worker, run this once:
```bash
curl -X POST http://localhost:8787/auth/seed \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"admin\", \"password\": \"yourpassword\", \"email\": \"admin@youremail.com\"}"
```

---

## Running locally

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend/worker
npm run dev
```
Worker runs on `http://localhost:8787`

**Terminal 2 — Frontend:**
```bash
cd frontend/personal-cloud
npm run dev
```
Frontend runs on `http://localhost:5173`

---

## Deployment

### Deploy Worker
```bash
cd backend/worker
npx wrangler secret put JWT_SECRET
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put GOOGLE_REDIRECT_URI
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put FROM_EMAIL
npm run deploy
```

After deploying, create the admin account:
```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/auth/seed \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"admin\", \"password\": \"yourpassword\"}"
```

Update Google OAuth redirect URI in Google Cloud Console:
```
https://your-worker.your-subdomain.workers.dev/auth/google/callback
```
### Deploy Frontend

Update `.env` with your deployed Worker URL:
```
VITE_WORKER_URL=https://your-worker.your-subdomain.workers.dev
```
Build and deploy to Cloudflare Pages:
```bash
npm run build
```

---

## Environment Variables

### Frontend (`frontend/personal-cloud/.env`)
| Variable | Description |
|---|---|
| `VITE_WORKER_URL` | URL of your Cloudflare Worker |

### Backend (`backend/worker/.dev.vars`)
| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | Google OAuth redirect URI |
| `RESEND_API_KEY` | Resend API key for sending emails |
| `FROM_EMAIL` | Sender email address |

---

## Testing API

```bash
# Format
curl [METHOD] [URL] [HEADERS] [BODY]
# -X = method (GET, POST, DELETE, PUT)
# -H = header
# -d = body

# Create admin (run once)
curl -X POST http://localhost:8787/auth/seed \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"admin\", \"password\": \"yourpassword\"}"

# Login
curl -X POST http://localhost:8787/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"admin\", \"password\": \"yourpassword\"}"

# List files (needs token)
curl http://localhost:8787/files \
  -H "Authorization: Bearer yourtoken"

# Delete file (needs token)
curl -X DELETE http://localhost:8787/files/myfile.jpg \
  -H "Authorization: Bearer yourtoken"

# List all users — admin only (needs admin token)
curl http://localhost:8787/admin/users \
  -H "Authorization: Bearer youradmintoken"

# List all requests — admin only (needs admin token)
curl http://localhost:8787/admin/requests \
  -H "Authorization: Bearer youradmintoken"

# Forgot password
curl -X POST http://localhost:8787/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"user@example.com\"}"

# Reset password (token from email link)
curl -X POST http://localhost:8787/auth/reset-password \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"yourtoken\", \"newPassword\": \"newpassword\"}"
```
