# Spendly

A personal finance tracker web application built with Next.js and PostgreSQL.

## Features

- User authentication (register, login, logout)
- Track income and expenses
- Set monthly budgets
- Categorize transactions
- Financial summaries

## Tech Stack

- **Frontend/Backend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/fernandoludvig/spendly.git
   cd spendly
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your `DATABASE_URL` and `JWT_SECRET`.

4. Set up the database:
   ```bash
   psql -U postgres -d spendly -f src/lib/schema.sql
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/          # Next.js App Router pages
├── components/   # Reusable UI components
├── lib/          # Database connection and utilities
└── types/        # TypeScript type definitions
```

## Sprint Plan

| Sprint | Goals |
|--------|-------|
| 1 | Project setup, DB schema, basic UI |
| 2 | Transaction & Category management |
| 3 | Budget tracking & summaries |
| 4 | UI polish, testing, deployment |
