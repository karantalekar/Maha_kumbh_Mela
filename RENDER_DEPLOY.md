# Render Deploy

This repo has two deployable apps:

- `backend`: Node/Express API and Socket.IO server
- `frontend`: Vite/React static site

## Backend service

Use these settings if creating the service manually:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Required environment variables:

- `MONGO_URI`: MongoDB Atlas connection string
- `CLIENT_URL`: deployed frontend URL, for example `https://your-frontend.onrender.com`
- `JWT_SECRET`: long random secret
- `ADMIN_SECRET`: secret used on the admin registration form
- `ENCRYPTION_SECRET`: long random secret for Aadhaar encryption

If deploying through `render.yaml`, Render can generate `JWT_SECRET`,
`ADMIN_SECRET`, and `ENCRYPTION_SECRET` for you. You still need to set
`MONGO_URI` and `CLIENT_URL`.

## Frontend static site

Use these settings if creating the static site manually:

- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

Required environment variable:

- `VITE_API_URL`: deployed backend URL, for example `https://your-backend.onrender.com`

## Important

Do not use `localhost` values on Render. `localhost` only points to the
running service container, not to your laptop or another Render service.
