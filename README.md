# SnapWall

A memory-sharing web app where users can pin their moments on a visual wall.

## Project Structure

```
snapwall/
├── frontend/   # React + Vite
└── backend/    # Node.js + Express
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

## Backend

```bash
cd backend
npm install
npm run start:dev
```

Runs on `http://localhost:3000`

## Environment Variables

Copy `.env.example` files in each folder and fill in your values.

### frontend/.env
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_APP_ID=
VITE_BACKEND_URL=http://localhost:3000
```

### backend/.env
```
FIREBASE_SERVICE_ACCOUNT=
FIREBASE_STORAGE_BUCKET=
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

## Tech Stack

- **Frontend**: React 19, Vite, Firebase Auth, Firestore, React Router, React Hot Toast
- **Backend**: Node.js, Express 5, Firebase Admin SDK
