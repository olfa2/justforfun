"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  LayoutGrid,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score >= 3) {
    return {
      score,
      label: "Stark genug",
      hint: "Gute Mischung aus Länge, Zeichen und Zahlen.",
      color: "oklch(0.74 0.14 155)",
    };
  }

  if (score === 2) {
    return {
      score,
      label: "Solide, aber noch ausbaufähig",
      hint: "Ein Sonderzeichen oder mehr Länge macht es besser.",
      color: "oklch(0.82 0.12 60)",
    };
  }

  return {
    score,
    label: "Noch eher schwach",
    hint: "Nutze mindestens 8 Zeichen mit Groß-/Kleinbuchstaben und Zahlen.",
    color: "oklch(0.78 0.13 25)",
  };
}

const inputShellClass =
  "group flex h-11 items-center gap-2.5 rounded-[10px] border border-white/[0.09] bg-[#101013] px-3.5 transition-[border-color,box-shadow] duration-150 focus-within:border-[oklch(0.66_0.19_280_/_0.55)] focus-within:shadow-[0_0_0_3px_oklch(0.66_0.19_280_/_0.14)]";

const inputClass =
  "min-w-0 flex-1 bg-transparent text-sm text-[#ECECEE] outline-none placeholder:text-[#71717A] disabled:cursor-not-allowed";

const previewStats = [
  { label: "Aktiv", value: "4" },
  { label: "Offen", value: "38" },
  { label: "Erledigt", value: "68%", color: "oklch(0.76 0.14 150)" },
];

const previewProjects = [
  { name: "Email-Kampagne", value: 72, color: "oklch(0.72 0.15 150)" },
  { name: "Website Relaunch", value: 45, color: "oklch(0.70 0.13 245)" },
  { name: "Onboarding Flow", value: 88, color: "oklch(0.70 0.15 300)" },
];

function BrandMark({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex items-center justify-center rounded-[10px] bg-accent text-accent-foreground ${
          compact ? "h-10 w-10" : "h-9 w-9"
        }`}
      >
        <LayoutGrid className={compact ? "h-5 w-5" : "h-[19px] w-[19px]"} />
      </div>
      {!compact && (
        <span className="text-[17px] font-semibold tracking-[-0.01em]">
          Projektmanagement
        </span>
      )}
    </div>
  );
}

function ShowcasePanel() {
  return (
    <aside className="relative hidden min-h-screen w-[600px] shrink-0 flex-col overflow-hidden border-r border-white/[0.05] bg-[#0B0B0E] px-12 py-11 text-[#ECECEE] min-[900px]:flex">
      <div className="absolute -left-20 -top-28 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,oklch(0.66_0.19_280_/_0.22),transparent_65%)] blur-[8px]" />
      <div className="absolute -bottom-40 -right-28 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,oklch(0.62_0.16_295_/_0.14),transparent_65%)]" />

      <div className="relative">
        <BrandMark />
      </div>

      <div className="relative mt-auto">
        <h1 className="max-w-[430px] text-[34px] font-semibold leading-[1.18] tracking-[-0.025em]">
          Behalte jedes Projekt im Blick — von Aufgabe bis Deadline.
        </h1>
        <p className="mt-4 max-w-[400px] text-[15px] leading-[1.55] text-[#8B8B93]">
          Kanban, Kalender, Zeiterfassung und Kennzahlen — alles an einem Ort,
          in einem ruhigen, fokussierten Workspace.
        </p>

        <div className="mt-[34px] max-w-[440px] rounded-[13px] border border-white/[0.07] bg-[#0F0F12] p-[18px]">
          <div className="mb-4 grid grid-cols-3 gap-2.5">
            {previewStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[9px] border border-white/[0.05] bg-[#131316] px-[13px] py-[11px]"
              >
                <div className="font-mono text-[9px] uppercase tracking-[0.05em] text-[#71717A]">
                  {stat.label}
                </div>
                <div
                  className="mt-1.5 font-mono text-[21px] font-semibold"
                  style={stat.color ? { color: stat.color } : undefined}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-[11px]">
            {previewProjects.map((project) => (
              <div key={project.name} className="flex items-center gap-3">
                <span className="w-[120px] truncate text-[11.5px] text-[#C7C7CC]">
                  {project.name}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-[#1A1A1E]">
                  <div
                    className="h-full rounded-[3px]"
                    style={{
                      width: `${project.value}%`,
                      backgroundColor: project.color,
                    }}
                  />
                </div>
                <span className="w-9 text-right font-mono text-[11px] text-[#71717A]">
                  {project.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-auto pt-10 font-mono text-xs text-[#52525B]">
        © 2026 · Alle Rechte vorbehalten
      </div>
    </aside>
  );
}

function PasswordStrength({ strength }) {
  const activeBars = Math.max(1, strength.score);

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className="h-1 rounded-full bg-white/[0.08]"
            style={
              index < activeBars
                ? { backgroundColor: strength.color }
                : undefined
            }
          />
        ))}
      </div>
      <div className="flex items-start justify-between gap-3 text-[12px]">
        <span className="font-medium" style={{ color: strength.color }}>
          {strength.label}
        </span>
        <span className="text-right text-[#71717A]">{strength.hint}</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";
  const strength = getPasswordStrength(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError("Die Passwörter stimmen nicht überein.");
        return;
      }
      if (strength.score < 3) {
        setError("Bitte wähle ein stärkeres Passwort.");
        return;
      }
    }

    setLoading(true);

    try {
      const supabase = createClient();

      if (isLogin) {
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
          setConfirmPassword("");
        }
      }
    } catch (err) {
      setError(translateError(err?.message));
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(isLogin ? "register" : "login");
    setError("");
    setInfo("");
    setConfirmPassword("");
  }

  return (
    <main className="flex min-h-screen bg-[#09090B] text-[#ECECEE]">
      <ShowcasePanel />

      <section className="flex min-h-screen flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 flex justify-center min-[900px]:hidden">
            <BrandMark compact />
          </div>

          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
              {isLogin ? "Willkommen zurück" : "Konto erstellen"}
            </h1>
            <p className="mt-1.5 text-sm text-[#8B8B93]">
              {isLogin
                ? "Melde dich bei deinem Workspace an."
                : "Erstelle ein Konto, um loszulegen."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-[18px]">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[13px] font-medium text-[#D4D4D8]"
              >
                E-Mail
              </label>
              <div className={inputShellClass}>
                <Mail className="h-4 w-4 shrink-0 text-[#71717A]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="du@beispiel.at"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-[13px] font-medium text-[#D4D4D8]"
                >
                  Passwort
                </label>
                {isLogin && (
                  <span className="text-[12.5px] font-medium text-nav-active">
                    Vergessen?
                  </span>
                )}
              </div>
              <div className={inputShellClass}>
                <Lock className="h-4 w-4 shrink-0 text-[#A1A1AA]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  minLength={isLogin ? 6 : 8}
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} tracking-[0.08em]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="text-[#71717A] transition-colors hover:text-[#D4D4D8]"
                  aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <PasswordStrength strength={strength} />

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-[13px] font-medium text-[#D4D4D8]"
                  >
                    Passwort bestätigen
                  </label>
                  <div className={inputShellClass}>
                    <Lock className="h-4 w-4 shrink-0 text-[#A1A1AA]" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      disabled={loading}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputClass} tracking-[0.08em]`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="text-[#71717A] transition-colors hover:text-[#D4D4D8]"
                      aria-label={
                        showConfirmPassword
                          ? "Passwortbestätigung verbergen"
                          : "Passwortbestätigung anzeigen"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {error && (
              <p className="rounded-[10px] border border-[oklch(0.65_0.20_25_/_0.45)] bg-[oklch(0.65_0.20_25_/_0.11)] px-3.5 py-2.5 text-[12.5px] text-[oklch(0.78_0.13_25)]">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-[10px] border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-[12.5px] text-nav-active">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-[46px] items-center justify-center gap-2.5 rounded-[10px] bg-accent text-[14.5px] font-semibold text-accent-foreground transition-colors duration-150 hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading
                ? isLogin
                  ? "Anmelden ..."
                  : "Registrieren ..."
                : isLogin
                  ? "Anmelden"
                  : "Registrieren"}
            </button>
          </form>

          <p className="mt-7 text-center text-[13.5px] text-[#8B8B93]">
            {isLogin ? "Noch kein Konto?" : "Bereits ein Konto?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="font-medium text-nav-active transition-colors hover:text-accent-hover"
            >
              {isLogin ? "Registrieren" : "Anmelden"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
