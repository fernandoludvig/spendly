import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import TransactionsPage from "./TransactionsPage";

export default function Transactions() {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    redirect("/login");
  }

  const user = verifyToken(token);
  if (!user) {
    redirect("/login");
  }

  return <TransactionsPage user={user} />;
}
