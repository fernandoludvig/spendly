export interface User {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  category_id: number;
  date: Date;
  created_at: Date;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: "income" | "expense";
}

export interface Budget {
  id: number;
  user_id: number;
  amount: number;
  month: number;
  year: number;
}
