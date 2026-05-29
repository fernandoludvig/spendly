import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let initialized = false;

async function initDb() {
  if (initialized) return;
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id),
        type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description VARCHAR(255),
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        month INTEGER CHECK (month BETWEEN 1 AND 12),
        year INTEGER NOT NULL
      );
    `);
    initialized = true;
    console.log("Database schema initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize database schema:", error);
  }
}

const DEFAULT_EXPENSE_CATEGORIES = [
  "Food",
  "Bills",
  "Transportation",
  "Entertainment",
  "Health",
  "Other",
];

const DEFAULT_INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Other Income",
];

export async function seedDefaultCategories(userId: number): Promise<void> {
  for (const name of DEFAULT_EXPENSE_CATEGORIES) {
    await query(
      "INSERT INTO categories (user_id, name, type) VALUES ($1, $2, 'expense')",
      [userId, name]
    );
  }
  for (const name of DEFAULT_INCOME_CATEGORIES) {
    await query(
      "INSERT INTO categories (user_id, name, type) VALUES ($1, $2, 'income')",
      [userId, name]
    );
  }
}

export async function query(text: string, params?: any[]) {
  if (!initialized) {
    await initDb();
  }
  return pool.query(text, params);
}

export default pool;
