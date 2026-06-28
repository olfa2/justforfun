import { redirect } from "next/navigation";

// Einstiegspunkt: leitet zum Dashboard (bzw. via Middleware zum Login) weiter.
export default function Home() {
  redirect("/dashboard");
}
