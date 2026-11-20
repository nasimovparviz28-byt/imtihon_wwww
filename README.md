# Najot Talim

React + Vite frontend and an Express backend that stores applications in MongoDB.

## Run locally

1. Start MongoDB. If Docker is installed, run `docker compose up -d` in this project to start a local MongoDB container. If you use MongoDB Atlas, set its connection string as `MONGODB_URI` in `.env`.
2. Start the backend and frontend together:

   ```bash
   npm run dev
   ```

This starts the frontend and backend together. Vite forwards `/api` requests to `http://localhost:5000`. The backend retries the MongoDB connection every five seconds if MongoDB is still starting.

## Deploy to Vercel

The Vercel build serves the Vite site and rewrites `/api/*` requests to the serverless Express handler in `api/index.js`.

1. In Vercel, set the project Root Directory to the repository root (not `frontend`).
2. Add these Environment Variables in **Settings → Environment Variables** for Production and Preview: `MONGODB_URI`, `AUTH_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ALLOW_ANY_LOGIN=false`. Copy secret values from your private local `.env`; never commit that file.
3. Redeploy after adding or changing environment variables.
4. In MongoDB Atlas, allow the Vercel runtime to connect. Vercel uses dynamic outbound IPs; Atlas's Vercel integration can configure the network access entry automatically. If configuring it manually, understand that `0.0.0.0/0` allows connections from any IP and use a database user with only the required permissions.

After deployment, check `https://YOUR-VERCEL-DOMAIN/api/health`; it should return `database: connected`.

## API

- `GET /api/health` reports server and MongoDB connection status.
- `GET /api/courses` returns the course list.
- `POST /api/leads` validates and stores an application in the `leads` collection. JSON body: `fullName`, `phone`, `course`, `branch`.

Keep private MongoDB connection strings in `.env`; never commit them to the repository.

## Student accounts

- New form submissions are saved as pending applications.
- Open `/admin` and use `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `.env` to review applications.
- Approving an application creates a student account. The student's phone number is the login; the generated temporary password is shown once in the admin panel. Use **Yangi parol berish** if it needs to be generated again.
- Students sign in at `/login` and reach their dashboard at `/cabinet`.
- Keep `AUTH_SECRET` and all `.env` credentials private. Set unique values before deploying.
- For local UI demos only, `.env` can set `ALLOW_ANY_LOGIN=true`; any non-empty login and password opens a demo student cabinet. This does not approve or save a student, and is automatically disabled when `NODE_ENV=production`. Keep it `false` for deployment.
