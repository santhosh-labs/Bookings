# SaaS Scheduler — Backend

Express + Drizzle ORM backend API server.

## Setup

```bash
npm install
```

## Environment Variables

Copy `.env` and fill in your values:

```
DATABASE_URL=mysql://root@localhost:3306/saas_scheduler
```

## Database

Push the schema to your MySQL database:

```bash
npm run db:push
```

## Development

```bash
npm run dev
```

The server starts on port `5000` by default (set `PORT` env var to change).

## Production

```bash
npm start
```

Or build and run with a process manager like PM2:

```bash
pm2 start "npm start" --name saas-backend
```
