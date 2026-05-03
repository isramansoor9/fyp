This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment variables (frontend)

Create a `.env.local` file (see `.env.example`). Point the Next.js app at your Flask API:

```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

Use the origin only (no trailing slash, no `/api` suffix). On [Vercel](https://vercel.com), add the same variable under Project → Settings → Environment Variables.

Restart the dev server after updating environment variables.

## Flask backend (API)

The backend is a standalone Flask service that handles auth against MongoDB and is CORS-allowed for the Next.js frontend.

1) Create `backend/.env` with:
```
MONGODB_URI="your-mongodb-connection-string"
MONGODB_DB="teachus"
# Frontend origin(s) for CORS — use your deployed Next URL in production, e.g.
# CORS_ORIGIN="https://your-app.vercel.app"
CORS_ORIGIN="http://localhost:3000"
# Optional: PORT="5000"
```

2) Install backend deps (from repo root):
```
cd backend
python -m venv .venv
./.venv/Scripts/activate   # Windows
pip install -r requirements.txt
python app.py
```

The API serves routes under `/api/...`. The frontend builds URLs from `NEXT_PUBLIC_API_URL` (see `lib/backendUrl.ts`), defaulting to `http://localhost:5000` when unset.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
