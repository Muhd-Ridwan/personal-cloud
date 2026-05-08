# Personal Cloud Drive

A self-hosted cloud storage app built with React + Cloudflare Workers + R2.

## Tech Stack

- **Frontend** — React, Vite, Tailwind CSS
- **Backend** — Cloudflare Workers, Hono
- **Storage** — Cloudflare R2
- **Auth** — JWT, bcrypt, Google OAuth

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
│       │   │   │   ├── FileGrid.jsx        # Grid view for files
│       │   │   │   ├── FileList.jsx        # List/table view for files
│       │   │   │   └── UploadButton.jsx    # Upload + drag & drop + new folder
│       │   │   ├── layout/
│       │   │   │   ├── AppLayout.jsx       # Main layout wrapper
│       │   │   │   ├── ProtectedRoute.jsx  # Redirect to login if not authenticated
│       │   │   │   ├── Sidebar.jsx         # Left navigation sidebar
│       │   │   │   └── TopBar.jsx          # Search bar + view toggle + logout
│       │   │   └── ui/
│       │   │       ├── Button.jsx          # Reusable button component
│       │   │       ├── ContextMenu.jsx     # Right-click context menu
│       │   │       ├── FileIcon.jsx        # File type icons with colors
│       │   │       └── Modal.jsx           # Reusable modal dialog
│       │   ├── context/
│       │   │   ├── AuthContext.jsx         # Auth state, login, logout
│       │   │   └── DriveContext.jsx        # File state, upload, delete
│       │   ├── pages/
│       │   │   ├── AuthCallbackPage.jsx    # Handles Google OAuth callback
│       │   │   ├── LoginPage.jsx           # Login + register page
│       │   │   ├── MyDrivePage.jsx         # Main drive with breadcrumbs
│       │   │   ├── RecentPage.jsx          # Recently modified files
│       │   │   ├── StarredPage.jsx         # Starred files
│       │   │   └── TrashPage.jsx           # Trash with restore/delete
│       │   ├── services/
│       │   │   └── r2Service.js            # All API calls to Worker
│       │   ├── utils/
│       │   │   └── fileUtils.js            # Format size, date, file type
│       │   ├── App.jsx                     # Router setup
│       │   ├── index.css                   # Tailwind + global styles
│       │   └── main.jsx                    # React entry point
│       ├── .env                            # Frontend env variables (gitignored)
│       ├── .env.example                    # Example env variables
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
│
└── backend/
    └── worker/
        ├── src/
        │   ├── routes/
        │   │   ├── auth.js                 # Login, register, Google OAuth routes
        │   │   └── files.js                # File CRUD routes
        │   ├── auth.js                     # JWT + password hashing
        │   ├── index.js                    # Hono app entry point
        │   ├── middleware.js               # Auth middleware + CORS
        │   └── r2.js                       # R2 file operations
        ├── .dev.vars                       # Local secrets (gitignored)
        ├── .dev.vars.example               # Example secrets
        ├── package.json
        └── wrangler.jsonc                  # Cloudflare Worker config
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

VITE_WORKER_URL=http://localhost:8787
### 3. Backend setup

```bash
cd backend/worker
npm install
```

Create KV namespace for users:
```bash
npx wrangler kv namespace create "USERS"
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

JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8787/auth/google/callback

### 4. Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Go to **APIs & Services** → **OAuth consent screen** → configure it
4. Go to **Credentials** → **Create OAuth Client ID**
5. Application type → **Web application**
6. Add Authorised JavaScript origins:

http://localhost:5173

7. Add Authorised redirect URIs:
http://localhost:8787/auth/google/callback

8. Copy **Client ID** and **Client Secret** into `.dev.vars`

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
npm run deploy
```

### Deploy Frontend
Update `.env` with your deployed Worker URL:
VITE_WORKER_URL=https://your-worker.your-subdomain.workers.dev

Then deploy to Cloudflare Pages via the Cloudflare dashboard or:
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


