"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

// Häufige Supabase-Fehlermeldungen ins Deutsche übersetzen.
function translateError(message) {
  if (!message) return "Ein unbekannter Fehler ist aufgetreten.";
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "E-Mail oder Passwort ist falsch.";
  if (m.includes("email not confirmed"))
    return "Bitte bestätige zuerst deine E-Mail-Adresse.";
  if (m.includes("user already registered"))
    return "Diese E-Mail ist bereits registriert.";
  if (m.includes("password should be at least"))
    return "Das Passwort muss mindestens 6 Zeichen lang sein.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "Bitte gib eine gültige E-Mail-Adresse ein.";
  if (m.includes("supabaseurl") || m.includes("supabasekey"))
    return "Supabase ist noch nicht konfiguriert (.env.local prüfen).";
  return message;
}

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setInfo(
            "Fast geschafft! Bestätige bitte den Link in deiner E-Mail und melde dich dann an."
          );
          setMode("login");
        }
      }
    } catch (err) {
      setError(translateError(err?.message));
    } finally {
      setLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Titel */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold">
            {isLogin ? "Willkommen zurück" : "Konto erstellen"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLogin
              ? "Melde dich bei deinem Dashboard an."
              : "Erstelle ein Konto, um loszulegen."}
          </p>
        </div>

        {/* Formular */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-border bg-card p-6"
        >
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="du@beispiel.at"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-md border border-accent/25 bg-accent/10 px-3 py-2 text-sm text-accent">
              {info}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLogin ? "Anmelden" : "Registrieren"}
          </Button>
        </form>

        {/* Umschalter Login / Registrieren */}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isLogin ? "Noch kein Konto?" : "Bereits ein Konto?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(isLogin ? "register" : "login");
              setError("");
              setInfo("");
            }}
            className="font-medium text-accent hover:underline"
          >
            {isLogin ? "Registrieren" : "Anmelden"}
          </button>
        </p>
      </div>
    </div>
  );
}
