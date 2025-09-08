## Folder Structure

```text
├── client/                # Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── hook/
│   │   ├── lib/
│   │   │   ├── request/
│   │   │   └── validations/
│   │   ├── page/
│   │   └── store/
│   └── public/
│
├── server/                # Backend (Express + TypeScript + TSup)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── service/
│   │   ├── utils/
│   │   └── validations/
│
└── shared-types/          # Shared TypeScript types for API responses
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Mahendradeokar/songsearch.git
cd songsearch
```

### 2. Frontend (Client)

**Development**

```bash
cd client
cp .env.development .env      # Use development environment variables
pnpm install                  # Install dependencies
pnpm run dev                  # Start development server
```

**Production**

```bash
cd client
cp .env.production .env       # Use production environment variables
pnpm install                  # Install dependencies
pnpm run build                # Build for production
pnpm run preview              # Preview production build
```

- Access the frontend at `http://localhost:5173` (Vite default).

---

### 3. Backend (Server)

**Development**

```bash
cd server
cp .env.development .env      # Use development environment variables
pnpm install                  # Install dependencies
pnpm run dev                  # Start development server
```

**Production**

```bash
cd server
cp .env.production .env       # Use production environment variables
pnpm install                  # Install dependencies
pnpm run build                # Build backend
pnpm start                    # Start production server
```

- The backend will run on the port specified in your `.env` file (commonly `http://localhost:3000`).

---

## Summary

| Component | Directory | Env File                               | Setup Command  | Run Command                         |
| --------- | --------- | -------------------------------------- | -------------- | ----------------------------------- |
| Frontend  | `client/` | `.env.development` / `.env.production` | `pnpm install` | `pnpm run dev` / `pnpm run preview` |
| Backend   | `server/` | `.env.development` / `.env.production` | `pnpm install` | `pnpm run dev` / `pnpm start`       |
